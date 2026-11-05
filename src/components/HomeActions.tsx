import { getTranslations } from "next-intl/server";
import Link from "next/link";

/**
 * Primary CTAs on the home page.
 */
export async function HomeActions() {
  const t = await getTranslations("Home");

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href="/inspections/new"
        className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover"
      >
        {t("startCta")}
      </Link>
      <Link
        href="/inspections"
        className="rounded border border-border bg-surface px-4 py-2 text-sm text-foreground"
      >
        {t("viewListCta")}
      </Link>
    </div>
  );
}
