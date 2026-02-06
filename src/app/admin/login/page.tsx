import LoginForm from "./login-form";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const notAuthorized = params.error === "not-authorized";

  return <LoginForm notAuthorized={notAuthorized} />;
}
