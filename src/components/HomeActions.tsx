import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { SessionUser } from "@/types/models";

interface HomeActionsProps {
  user: SessionUser;
}

/**
 * Home links that match the signed-in role. Creating an inspection stays QE-only.
 */
export async function HomeActions({ user }: HomeActionsProps) {
  const t = await getTranslations("Home");
  const tRole = await getTranslations("Role");
  const isEngineer = user.role === "QUALITY_ENGINEER";

  return (
    <div className="stack">
      <p>
        {t("signedInAs", {
          name: user.name,
          role: tRole(user.role),
        })}
      </p>
      <div className="row-actions">
        {isEngineer ? (
          <>
            <Link className="btn-primary" href="/batches">
              {t("batchesCta")}
            </Link>
            <Link className="btn-primary" href="/inspections/new">
              {t("startCta")}
            </Link>
          </>
        ) : null}
        <Link className="btn-secondary" href="/inspections">
          {t("viewListCta")}
        </Link>
        <Link className="btn-secondary" href="/dashboard">
          {t("dashboardCta")}
        </Link>
      </div>
    </div>
  );
}
