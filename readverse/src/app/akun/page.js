import { requireUser } from "../../lib/auth";
import { logoutAction } from "../actions/auth";

export const metadata = {
  title: "Akun Saya — BookVerse",
};

export default async function AccountPage() {
  const user = await requireUser();

  const roleLabels = {
    admin: "Administrator",
    pegawai: "Pegawai",
    mahasiswa: "Mahasiswa",
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F8F7F3] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-[#D6D3CD] bg-white p-6 sm:p-8">
        <p className="text-2xl font-extrabold tracking-tight text-[#244536]">
          BookVerse
        </p>

        <span className="mt-6 inline-flex rounded-md border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
          Akun Aktif
        </span>

        <h1 className="mt-4 text-2xl font-bold leading-snug text-[#18181B]">
          Selamat datang, {user.nama}
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#52525B]">
          Anda berhasil masuk ke sistem perpustakaan.
        </p>

        <dl className="mt-6 divide-y divide-[#D6D3CD]">
          <div className="py-4">
            <dt className="text-xs text-[#52525B]">
              NIM / ID Anggota
            </dt>
            <dd className="mt-2 break-all font-mono text-sm text-[#18181B]">
              {user.nim}
            </dd>
          </div>

          <div className="py-4">
            <dt className="text-xs text-[#52525B]">
              Email
            </dt>
            <dd className="mt-2 break-all text-sm text-[#18181B]">
              {user.email}
            </dd>
          </div>

          <div className="py-4">
            <dt className="text-xs text-[#52525B]">
              Peran
            </dt>
            <dd className="mt-2 text-sm font-semibold text-[#244536]">
              {roleLabels[user.role] ?? user.role}
            </dd>
          </div>
        </dl>

        <form action={logoutAction} className="mt-6">
          <button
            type="submit"
            className="min-h-11 w-full rounded-lg bg-[#244536] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#18382A] active:scale-[0.98]"
          >
            Keluar
          </button>
        </form>
      </section>
    </main>
  );
}