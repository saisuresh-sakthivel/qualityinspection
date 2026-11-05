import { getTranslations } from "next-intl/server";
import { HomeActions } from "@/components/HomeActions";
import { PageShell } from "@/components/PageShell";

/**
 * Landing page for the quality inspection app.
 */
export default async function HomePage() {
  const t = await getTranslations("Home");

  return (
    <PageShell title={t("heading")} description={t("description")}>
      <HomeActions />
      <p className="mt-6 text-sm">{t("prereqNote")}</p>
    </PageShell>
  );
}
