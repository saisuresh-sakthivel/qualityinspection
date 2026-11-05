import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/PageShell";
import { getCurrentUser } from "@/lib/auth";

/**
 * Blocks Production Supervisors from batch and inspection-create screens.
 */
export async function QualityEngineerOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user?.role === "QUALITY_ENGINEER") {
    return children;
  }

  const t = await getTranslations("Auth");
  return (
    <PageShell title={t("forbiddenHeading")} description={t("forbidden")} />
  );
}
