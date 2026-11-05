import { getTranslations } from "next-intl/server";
import { LoginBrand } from "@/components/LoginBrand";
import { LoginForm } from "@/components/LoginForm";
import type { FormFieldSchema } from "@/types/form";

/**
 * Login screen. A signed-in visitor is redirected to the batch list by proxy.ts.
 * Field copy is resolved here and handed to the shared form as a schema.
 */
export default async function LoginPage() {
  const t = await getTranslations("Auth");
  const schema: FormFieldSchema[] = [
    {
      name: "username",
      type: "text",
      label: t("username"),
      validation: { required: true },
      autoComplete: "username",
    },
    {
      name: "password",
      type: "password",
      label: t("password"),
      validation: { required: true },
      autoComplete: "current-password",
    },
  ];

  return (
    <div className="login-screen">
      <LoginBrand title={t("screenTitle")} />
      <main className="login-panel">
        <LoginForm schema={schema} />
      </main>
    </div>
  );
}
