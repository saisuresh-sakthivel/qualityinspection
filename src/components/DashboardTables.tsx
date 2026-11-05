import { getTranslations } from "next-intl/server";
import { DEFECT_TYPES } from "@/domain/defects";
import type { InspectionKpis } from "@/types/models";

interface DashboardTablesProps {
  kpis: InspectionKpis;
}

/**
 * Aggregated KPI and defect-count tables, including No Defect.
 */
export async function DashboardTables({ kpis }: DashboardTablesProps) {
  const t = await getTranslations("Dashboard");
  const tDefect = await getTranslations("DefectType");

  const kpiRows = [
    [t("totalInspected"), String(kpis.total)],
    [t("passed"), String(kpis.passed)],
    [t("rejected"), String(kpis.rejected)],
    [t("defectRate"), t("percent", { value: Math.round(kpis.defectRate * 100) })],
    [
      t("aiAcceptanceRate"),
      t("percent", { value: Math.round(kpis.aiAcceptanceRate * 100) }),
    ],
  ] as const;

  return (
    <div className="dashboard-tables">
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">{t("kpi")}</th>
              <th scope="col">{t("value")}</th>
            </tr>
          </thead>
          <tbody>
            {kpiRows.map(([label, value]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">{t("defectType")}</th>
              <th scope="col">{t("count")}</th>
            </tr>
          </thead>
          <tbody>
            {DEFECT_TYPES.map((type) => (
              <tr key={type}>
                <td>{tDefect(type)}</td>
                <td>{kpis.defectBreakdown[type]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
