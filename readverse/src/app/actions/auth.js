"use server";

import { redirect } from "next/navigation";
import { getDb } from "../../lib/db";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  checkLoginAttempts,
  clearLoginAttempts,
} from "../../lib/auth";

function readField(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function databaseError(error) {
  // Detail teknis hanya dicatat pada server.
  console.error("Operasi akun gagal.", {
    code: error?.code ?? "UNKNOWN",
  });

  return {
    error:
      "Tidak dapat terhubung ke layanan saat ini. Silakan coba beberapa saat lagi.",
  };
}

// REGISTRASI MAHASISWA
export async function registerAction(previousState, formData) {
  const nama = readField(formData, "nama").trim();
  const nim = readField(formData, "nim").trim().toUpperCase();
  const email = readField(formData, "email").trim().toLowerCase();

  // Jangan trim kata sandi karena spasi bisa menjadi bagian kata sandi.
  const password = readField(formData, "password");

  if (nama.length < 3 || nama.length > 100) {
    return {
      error: "Nama lengkap harus terdiri dari 3–100 karakter.",
    };
  }

  if (!/^[A-Z0-9]{5,30}$/.test(nim)) {
    return {
      error: "NIM harus terdiri dari 5–30 huruf atau angka.",
    };
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return {
      error: "Masukkan alamat email yang valid.",
    };
  }

  if (password.length < 8) {
    return {
      error: "Kata sandi minimal 8 karakter.",
    };
  }

  if (password.length > 128) {
    return {
      error: "Kata sandi maksimal 128 karakter.",
    };
  }

  try {
    const passwordHash = await hashPassword(password);

    // Role ditentukan server agar pendaftaran publik hanya untuk mahasiswa.
    await getDb().query(
      `
        INSERT INTO users (
          nama,
          nim,
          email,
          password_hash,
          role
        )
        VALUES ($1, $2, $3, $4, 'mahasiswa')
      `,
      [nama, nim, email, passwordHash]
    );
  } catch (error) {
    if (error?.code === "23505") {
      return {
        error: "NIM atau email sudah terdaftar.",
      };
    }

    return databaseError(error);
  }

  redirect("/masuk?terdaftar=1");
}

// LOGIN SEMUA PERAN
export async function loginAction(previousState, formData) {
  const identifier = readField(formData, "identifier").trim();
  const password = readField(formData, "password");

  if (!identifier) {
    return {
      error: "NIM atau email wajib diisi.",
    };
  }

  if (identifier.length > 254) {
    return {
      error: "Masukkan NIM atau email yang valid.",
    };
  }

  if (!password) {
    return {
      error: "Kata sandi wajib diisi.",
    };
  }

  if (password.length > 128) {
    return {
      error: "Kata sandi maksimal 128 karakter.",
    };
  }

  const normalizedIdentifier = identifier.toLowerCase();

  try {
    const allowed = await checkLoginAttempts(normalizedIdentifier);

    if (!allowed) {
      return {
        error:
          "Terlalu banyak percobaan masuk. Silakan coba lagi setelah 15 menit.",
      };
    }

    const result = await getDb().query(
      `
        SELECT
          id,
          password_hash,
          status
        FROM users
        WHERE email = $1 OR nim = $2
        LIMIT 1
      `,
      [normalizedIdentifier, identifier.toUpperCase()]
    );

    const user = result.rows[0];

    if (!user) {
      // Tetap jalankan proses hash untuk mengurangi perbedaan
      // waktu respons antara akun yang ada dan tidak ada.
      await hashPassword(password);

      return {
        error: "NIM, email, atau kata sandi tidak sesuai.",
      };
    }

    const passwordValid = await verifyPassword(
      password,
      user.password_hash
    );

    if (!passwordValid || user.status !== "aktif") {
      return {
        error: "NIM, email, atau kata sandi tidak sesuai.",
      };
    }

    await clearLoginAttempts(normalizedIdentifier);
    await createSession(user.id);
  } catch (error) {
    return databaseError(error);
  }

  redirect("/akun");
}

// LOGOUT
export async function logoutAction() {
  await destroySession();
  redirect("/masuk");
}