import AuthForm from "../../components/auth/AuthForm";

export const metadata = {
  title: "Masuk — BookVerse",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  return (
    <AuthForm
      mode="login"
      registered={params.terdaftar === "1"}
    />
  );
}