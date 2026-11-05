import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { RoleSwitcher } from "@/components/RoleSwitcher";

/**
 * Top navigation bar shared across App Router pages.
 */
export async function AppHeader() {
  const t = await getTranslations("Nav");
  const tApp = await getTranslations("App");

  return (
    <header className="border-b border-border bg-muted">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-foreground">
            {tApp("title")}
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/">{t("home")}</Link>
            <Link href="/inspections/new">{t("newInspection")}</Link>
            <Link href="/inspections">{t("inspections")}</Link>
            <Link href="/dashboard">{t("dashboard")}</Link>
          </nav>
        </div>
        <RoleSwitcher />
      </div>
    </header>
  );
}
