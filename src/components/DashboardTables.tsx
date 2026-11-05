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
    [t("aiAcceptanceRate"), t("percent", { value: Math.round(kpis.aiAcceptanceRate * 100) })],
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-accent px-4 py-3.5 text-left text-sm font-semibold" scope="col">
                {t("kpi")}
              </th>
              <th className="bg-accent px-4 py-3.5 text-left text-sm font-semibold" scope="col">
                {t("value")}
              </th>
            </tr>
          </thead>
          <tbody>
            {kpiRows.map(([label, value]) => (
              <tr key={label}>
                <td className="border-b border-border px-4 py-3.5 text-left text-base [tr:last-child_&]:border-b-0">
                  {label}
                </td>
                <td className="border-b border-border px-4 py-3.5 text-left text-base [tr:last-child_&]:border-b-0">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-accent px-4 py-3.5 text-left text-sm font-semibold" scope="col">
                {t("defectType")}
              </th>
              <th className="bg-accent px-4 py-3.5 text-left text-sm font-semibold" scope="col">
                {t("count")}
              </th>
            </tr>
          </thead>
          <tbody>
            {DEFECT_TYPES.map((type) => (
              <tr key={type}>
                <td className="border-b border-border px-4 py-3.5 text-left text-base [tr:last-child_&]:border-b-0">
                  {tDefect(type)}
                </td>
                <td className="border-b border-border px-4 py-3.5 text-left text-base [tr:last-child_&]:border-b-0">
                  {kpis.defectBreakdown[type]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
