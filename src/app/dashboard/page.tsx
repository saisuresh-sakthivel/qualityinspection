import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/PageShell";

/**
 * KPI dashboard placeholder.
 */
export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");

  return (
    <PageShell title={t("heading")}>
      <p>{t("placeholder")}</p>
    </PageShell>
  );
}
