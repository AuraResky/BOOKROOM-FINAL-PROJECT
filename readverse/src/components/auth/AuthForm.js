"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction, registerAction } from "../../app/actions/auth";

function BookIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 7v14" />
      <path d="M3 3h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z" />
    </svg>
  );
}

function EyeIcon({ crossed = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {crossed ? (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.8 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.1 4.1" />
          <path d="M6.2 6.2A18 18 0 0 0 2 12s3.5 7 10 7a11 11 0 0 0 5.8-1.8" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function FormField({
  id,
  label,
  type = "text",
  error,
  helperText,
  ...props
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  const inputType = isPassword
    ? visible
      ? "text"
      : "password"
    : type;

  const toggleLabel = visible
    ? "Sembunyikan kata sandi"
    : "Tampilkan kata sandi";

  const describedBy = [
    helperText ? `${id}-helper` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[#18181B]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={[
            "min-h-11 w-full rounded-lg border bg-[#FBFAF7]",
            "px-3.5 py-3 text-sm leading-6 text-[#18181B]",
            "outline-none transition-colors duration-200 ease-out",
            "placeholder:text-[#71717A]",
            "disabled:cursor-not-allowed disabled:opacity-60",
            isPassword ? "pr-12" : "",
            error
              ? "border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/15"
              : "border-[#D6D3CD] hover:border-[#A8A69F] focus:border-[#244536] focus:ring-2 focus:ring-[#244536]/15",
          ].join(" ")}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((previous) => !previous)}
            aria-label={toggleLabel}
            title={toggleLabel}
            aria-pressed={visible}
            className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md border-0 bg-transparent p-2 text-[#71717A] shadow-none transition-colors duration-200 ease-out hover:bg-transparent hover:text-[#244536] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244536]/30"
          >
            <EyeIcon crossed={visible} />
          </button>
        )}
      </div>

      {helperText && (
        <p
          id={`${id}-helper`}
          className="mt-1.5 text-xs leading-5 text-[#52525B]"
        >
          {helperText}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-sm leading-6 text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function validateForm(values, isRegister) {
  const errors = {};

  if (isRegister) {
    const nama = String(values.nama || "").trim();
    const nim = String(values.nim || "").trim();
    const email = String(values.email || "").trim();

    if (!nama) {
      errors.nama = "Nama lengkap wajib diisi";
    } else if (nama.length < 3 || nama.length > 100) {
      errors.nama = "Nama lengkap harus terdiri dari 3–100 karakter";
    }

    if (!nim) {
      errors.nim = "NIM wajib diisi";
    } else if (!/^[A-Za-z0-9]{5,30}$/.test(nim)) {
      errors.nim = "NIM harus terdiri dari 5–30 huruf atau angka";
    }

    if (!email) {
      errors.email = "Email wajib diisi";
    } else if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email = "Masukkan alamat email yang valid";
    }
  } else {
    const identifier = String(values.identifier || "").trim();

    if (!identifier) {
      errors.identifier = "NIM atau email wajib diisi";
    } else if (identifier.length > 254) {
      errors.identifier = "Masukkan NIM atau email yang valid";
    } else if (identifier.includes("@")) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        errors.identifier = "Masukkan alamat email yang valid";
      }
    } else if (!/^[A-Za-z0-9]{5,30}$/.test(identifier)) {
      errors.identifier = "Masukkan NIM atau email yang valid";
    }
  }

  const password = String(values.password || "");

  if (!password) {
    errors.password = "Kata sandi wajib diisi";
  } else if (isRegister && password.length < 8) {
    errors.password = "Kata sandi minimal 8 karakter";
  } else if (password.length > 128) {
    errors.password = "Kata sandi maksimal 128 karakter";
  }

  return errors;
}

const benefits = [
  {
    number: "01",
    title: "Ajukan peminjaman",
    description:
      "Temukan buku dan ajukan peminjaman melalui akun mahasiswa.",
  },
  {
    number: "02",
    title: "Pantau tanggal kembali",
    description: "Periksa status pengajuan dan jatuh tempo pinjaman.",
  },
  {
    number: "03",
    title: "Simpan jejak bacaan",
    description:
      "Lihat kembali buku yang pernah menemani perjalanan belajarmu.",
  },
];

export default function AuthForm({ mode, registered = false }) {
  const isRegister = mode === "register";

  const [state, formAction, pending] = useActionState(
    isRegister ? registerAction : loginAction,
    { error: "" }
  );

  const [fieldErrors, setFieldErrors] = useState({});

  function handleSubmit(event) {
    const values = Object.fromEntries(
      new FormData(event.currentTarget)
    );

    const errors = validateForm(values, isRegister);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      event.preventDefault();

      const firstFieldName = Object.keys(errors)[0];
      const firstField =
        event.currentTarget.elements.namedItem(firstFieldName);

      firstField?.focus();
    }
  }

  function handleChange(event) {
    const name = event.target.name;

    if (!name) return;

    setFieldErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  }

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

  // Menangani pesan lama jika backend belum diperbarui.
  const systemError =
    state?.error ===
    "Layanan akun belum tersedia. Periksa koneksi dan tabel database."
      ? "Tidak dapat terhubung ke layanan saat ini. Silakan coba beberapa saat lagi."
      : state?.error;

  const tabClass = (active) =>
    [
      "rounded-md px-4 py-2.5 text-center text-sm font-semibold",
      "transition-colors duration-200 ease-out",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-[#244536]/30",
      active
        ? "bg-white text-[#244536] shadow-sm"
        : "text-[#52525B] hover:bg-white/70 hover:text-[#244536]",
    ].join(" ");

  return (
    <div className="min-h-dvh bg-[#F8F7F3] text-[#18181B]">
      <header className="border-b border-[#D6D3CD] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244536]/30"
            aria-label="BookVerse — Beranda"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-[#D6D3CD] bg-[#EDF2EB] text-[#244536]">
              <BookIcon />
            </span>

            <span>
              <span className="block text-xl font-extrabold tracking-tight text-[#244536]">
                BookVerse
              </span>

              <span className="block text-[9px] font-semibold tracking-[0.15em] text-[#52525B]">
                PERPUSTAKAAN DIGITAL
              </span>
            </span>
          </Link>

          <p className="hidden text-sm text-[#52525B] sm:block">
            Ruang untuk setiap cerita.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 lg:min-h-[calc(100dvh-170px)] lg:grid-cols-2 lg:gap-20 lg:py-14">
        <section>
          <span className="inline-flex rounded-md border border-[#D6D3CD] bg-[#EEEAE0] px-3 py-2 text-[10px] font-bold tracking-[0.12em] text-[#244536]">
            AKUN ANGGOTA / BOOKVERSE
          </span>

          <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Buku pilihanmu,
            <span className="block text-[#244536]">
              selangkah lebih dekat.
            </span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-[#52525B]">
            {isRegister
              ? "Daftarkan akun mahasiswa untuk mulai meminjam buku dan mengakses layanan perpustakaan."
              : "Masuk untuk meminjam buku dan melihat aktivitas perpustakaanmu dalam satu tempat."}
          </p>

          <div className="mt-8 hidden space-y-6 lg:block">
            {benefits.map((benefit) => (
              <div
                key={benefit.number}
                className="flex items-start gap-4"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#D6D3CD] bg-white font-mono text-xs font-semibold text-[#244536]">
                  {benefit.number}
                </span>

                <div>
                  <h2 className="text-sm font-bold text-[#18181B]">
                    {benefit.title}
                  </h2>

                  <p className="mt-1 text-xs leading-6 text-[#52525B]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="auth-form-title"
          className="w-full min-w-0 rounded-xl border border-[#D6D3CD] bg-white p-6 sm:p-8"
        >
          <nav
            aria-label="Pilihan akses akun"
            className="mb-7 grid grid-cols-2 gap-1 rounded-lg border border-[#D6D3CD] bg-[#F3F2ED] p-1"
          >
            <Link
              href="/masuk"
              aria-current={!isRegister ? "page" : undefined}
              className={tabClass(!isRegister)}
            >
              Masuk
            </Link>

            <Link
              href="/daftar"
              aria-current={isRegister ? "page" : undefined}
              className={tabClass(isRegister)}
            >
              Daftar
            </Link>
          </nav>

          <h2
            id="auth-form-title"
            className="text-2xl font-bold tracking-tight text-[#18181B]"
          >
            {isRegister
              ? "Daftar Akun Mahasiswa"
              : "Selamat datang kembali."}
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#52525B]">
            {isRegister
              ? "Lengkapi identitas mahasiswa untuk membuat akun."
              : "Masuk menggunakan akun perpustakaan Anda."}
          </p>

          {registered && !isRegister && (
            <div
              role="status"
              className="mt-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm leading-6 text-green-800"
            >
              Pendaftaran berhasil. Silakan masuk.
            </div>
          )}

          <form
            action={formAction}
            onSubmit={handleSubmit}
            onChange={handleChange}
            noValidate
            aria-busy={pending}
            className="mt-6 space-y-4"
          >
            {isRegister ? (
              <>
                <FormField
                  id="nama"
                  name="nama"
                  label="Nama lengkap"
                  placeholder="Nama sesuai identitas mahasiswa"
                  autoComplete="name"
                  minLength={3}
                  maxLength={100}
                  error={fieldErrors.nama}
                  required
                />

                <FormField
                  id="nim"
                  name="nim"
                  label="NIM"
                  placeholder="Masukkan NIM"
                  autoCapitalize="characters"
                  spellCheck={false}
                  minLength={5}
                  maxLength={30}
                  error={fieldErrors.nim}
                  required
                />

                <FormField
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="nama@kampus.ac.id"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={254}
                  error={fieldErrors.email}
                  required
                />
              </>
            ) : (
              <FormField
                id="identifier"
                name="identifier"
                label="NIM atau email"
                placeholder="Masukkan NIM atau email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={254}
                error={fieldErrors.identifier}
                required
              />
            )}

            <FormField
              id="password"
              name="password"
              type="password"
              label="Kata sandi"
              placeholder="Masukkan kata sandi"
              autoComplete={
                isRegister ? "new-password" : "current-password"
              }
              minLength={isRegister ? 8 : 1}
              maxLength={128}
              helperText={
                isRegister ? "Minimal 8 karakter" : undefined
              }
              error={fieldErrors.password}
              required
            />


            {!pending && systemError && !hasFieldErrors && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
              >
                {systemError}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="min-h-11 w-full rounded-lg border border-[#244536] bg-[#244536] px-4 py-3 text-sm font-semibold text-white transition duration-200 ease-out hover:border-[#18382A] hover:bg-[#18382A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244536] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {pending
                ? "Memproses..."
                : isRegister
                  ? "Daftar Anggota"
                  : "Masuk"}
            </button>
          </form>

          <p className="mt-5 text-xs leading-6 text-[#52525B]">
            Jaga kerahasiaan kata sandi dan gunakan akun sesuai
            identitas Anda.
          </p>

          <div className="mt-6 border-t border-[#D6D3CD] pt-5 text-center text-sm leading-7 text-[#52525B]">
            {isRegister ? (
              <p>
                Sudah memiliki akun?{" "}
                <Link
                  href="/masuk"
                  className="font-bold text-[#244536] underline-offset-4 hover:underline"
                >
                  Masuk sekarang
                </Link>
              </p>
            ) : (
              <p>
                Belum memiliki akun mahasiswa?{" "}
                <Link
                  href="/daftar"
                  className="font-bold text-[#244536] underline-offset-4 hover:underline"
                >
                  Daftar sekarang
                </Link>
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="px-5 pb-6 text-center text-xs leading-6 text-[#52525B]">
        BookVerse · Ruang untuk setiap cerita.
      </footer>
    </div>
  );
}