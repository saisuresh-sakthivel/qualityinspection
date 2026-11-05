import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LogOut, PackageCheck } from "lucide-react";
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
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border bg-surface px-6 py-3.5">
      <div className="flex flex-col justify-self-start gap-0.5">
        <Link href={user ? "/batches" : "/login"} className="flex items-center gap-2">
          <PackageCheck className="size-8 shrink-0" aria-hidden="true" />
          <span className="text-lg font-semibold italic">{tApp("title")}</span>
        </Link>
        {user ? <p className="m-0 pl-10 text-sm">{tRole(user.role)}</p> : null}
      </div>
      {user ? <AppNav /> : <span />}
      {user ? (
        <div className="flex items-center justify-end gap-3">
          <span className="text-base font-semibold">{givenName(user.name)}</span>
          <form action={logout}>
            <button
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-border bg-surface p-0 text-foreground hover:bg-accent"
              type="submit"
              aria-label={t("logout")}
            >
              <LogOut className="size-4.5" aria-hidden="true" />
            </button>
          </form>
        </div>
      ) : (
        <span />
      )}
    </header>
  );
}
