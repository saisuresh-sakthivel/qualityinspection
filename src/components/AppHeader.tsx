import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { logout } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/auth";

/**
 * Top navigation. Inspection and batch links are hidden for supervisors; the API still rejects them.
 */
export async function AppHeader() {
  const t = await getTranslations("Nav");
  const tApp = await getTranslations("App");
  const user = await getCurrentUser();
  const isEngineer = user?.role === "QUALITY_ENGINEER";

  return (
    <header className="border-b border-border bg-muted">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-foreground">
            {tApp("title")}
          </Link>
          {user ? (
            <nav className="flex gap-4 text-sm">
              <Link href="/">{t("home")}</Link>
              {isEngineer ? <Link href="/batches">{t("batches")}</Link> : null}
              <Link href="/inspections">{t("inspections")}</Link>
              <Link href="/dashboard">{t("dashboard")}</Link>
            </nav>
          ) : null}
        </div>
        {user ? (
          <form action={logout}>
            <button className="btn-secondary" type="submit">
              {t("logout")}
            </button>
          </form>
        ) : (
          <Link href="/login">{t("login")}</Link>
        )}
      </div>
    </header>
  );
}
