import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/PageShell";

/**
 * Inspection list placeholder (filters + rows come next).
 */
export default async function InspectionsPage() {
  const t = await getTranslations("Inspection");

  return (
    <PageShell title={t("listHeading")}>
      <p>{t("listPlaceholder")}</p>
    </PageShell>
  );
}
