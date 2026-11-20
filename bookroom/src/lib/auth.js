import "server-only";
import {
  randomBytes,
  createHash,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";

const scryptAsync = promisify(scrypt);

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-bookverse_session"
    : "bookverse_session";

const SESSION_SECONDS = 60 * 60 * 24 * 7;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");

  const key = await scryptAsync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });

  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  if (
    typeof storedHash !== "string" ||
    !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(storedHash)
  ) {
    return false;
  }

  const [, salt, expectedHex] = storedHash.split("$");

  const actual = await scryptAsync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });

  const expected = Buffer.from(expectedHex, "hex");

  return timingSafeEqual(actual, expected);
}

export async function createSession(userId) {
  const token = randomBytes(32).toString("hex");

  const expiresAt = new Date(
    Date.now() + SESSION_SECONDS * 1000,
  );

  await getDb().query(
    `INSERT INTO auth_sessions
       (token_hash, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [sha256(token), userId, expiresAt],
  );

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
    expires: expiresAt,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  const result = await getDb().query(
    `SELECT
       u.id,
       u.nama,
       u.nim,
       u.email,
       u.role
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1
       AND s.expires_at > NOW()
       AND u.status = 'aktif'
     LIMIT 1`,
    [sha256(token)],
  );

  return result.rows[0] ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/masuk");
  }

  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token && /^[a-f0-9]{64}$/.test(token)) {
    await getDb().query(
      "DELETE FROM auth_sessions WHERE token_hash = $1",
      [sha256(token)],
    );
  }

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function checkLoginAttempts(identifier) {
  const result = await getDb().query(
    `INSERT INTO auth_login_attempts
       (identifier_hash, attempts, started_at)
     VALUES ($1, 1, NOW())
     ON CONFLICT (identifier_hash)
     DO UPDATE SET
       attempts = CASE
         WHEN auth_login_attempts.started_at
              < NOW() - INTERVAL '15 minutes'
         THEN 1
         ELSE auth_login_attempts.attempts + 1
       END,
       started_at = CASE
         WHEN auth_login_attempts.started_at
              < NOW() - INTERVAL '15 minutes'
         THEN NOW()
         ELSE auth_login_attempts.started_at
       END
     RETURNING attempts`,
    [sha256(identifier.toLowerCase())],
  );

  return result.rows[0].attempts <= 5;
}

export async function clearLoginAttempts(identifier) {
  await getDb().query(
    `DELETE FROM auth_login_attempts
     WHERE identifier_hash = $1`,
    [sha256(identifier.toLowerCase())],
  );
}