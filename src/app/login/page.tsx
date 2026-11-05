import { getTranslations } from "next-intl/server";
import { LoginBrand } from "@/components/LoginBrand";
import { LoginForm } from "@/components/LoginForm";

/**
 * Login screen. A signed-in visitor is redirected to home by proxy.ts.
 */
export default async function LoginPage() {
  const t = await getTranslations("Auth");

  return (
    <div className="login-screen">
      <LoginBrand title={t("screenTitle")} />
      <main className="login-panel">
        <LoginForm />
      </main>
    </div>
  );
}
