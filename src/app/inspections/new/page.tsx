import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/PageShell";

/**
 * New inspection flow placeholder (upload → predict → confirm).
 */
export default async function NewInspectionPage() {
  const t = await getTranslations("Inspection");

  return (
    <PageShell title={t("newHeading")}>
      <p>{t("placeholder")}</p>
    </PageShell>
  );
}
