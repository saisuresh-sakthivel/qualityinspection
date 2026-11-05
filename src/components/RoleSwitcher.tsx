import { getTranslations } from "next-intl/server";

/**
 * Placeholder role switcher UI.
 * Cookie/session wiring lands with the auth-roles work.
 */
export async function RoleSwitcher() {
  const t = await getTranslations("Role");

  return (
    <div className="flex items-center gap-2 text-sm text-text-muted">
      <span>{t("label")}:</span>
      <span className="rounded bg-accent px-2 py-1 text-foreground">
        {t("qualityEngineer")}
      </span>
    </div>
  );
}
