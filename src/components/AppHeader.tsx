import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { logout } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/auth";

/**
 * The header shows the given name, such as "Priya" from "Priya Singh".
 */
function givenName(fullName: string): string {
  const [first] = fullName.trim().split(/\s+/);
  return first || fullName;
}

/**
 * Global header. Logout, the role, and the menus appear only after sign-in.
 */
export async function AppHeader() {
  const t = await getTranslations("Nav");
  const tApp = await getTranslations("App");
  const tRole = await getTranslations("Role");
  const user = await getCurrentUser();

  return (
    <header className="app-header">
      <div className="app-brand">
        <Link href={user ? "/batches" : "/login"} className="app-brand-title">
          {tApp("title")}
        </Link>
        {user ? <p className="app-brand-role">{tRole(user.role)}</p> : null}
      </div>
      {user ? (
        <AppNav />
      ) : (
        <span />
      )}
      {user ? (
        <div className="app-header-actions">
          <span className="app-header-name">{givenName(user.name)}</span>
          <form action={logout}>
            <button className="btn-secondary" type="submit">
              {t("logout")}
            </button>
          </form>
        </div>
      ) : (
        <span />
      )}
    </header>
  );
}
