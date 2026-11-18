import AuthForm from "../../components/auth/AuthForm";

export const metadata = {
  title: "Daftar Mahasiswa — BookVerse",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}