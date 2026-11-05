import { getTranslations } from "next-intl/server";
import { HomeActions } from "@/components/HomeActions";
import { PageShell } from "@/components/PageShell";
import { getCurrentUser } from "@/lib/auth";

/**
 * Landing page after login. Anonymous visitors are redirected by proxy.ts.
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const t = await getTranslations("Home");

  return (
    <PageShell title={t("heading")} description={t("description")}>
      <HomeActions user={user} />
    </PageShell>
  );
}
