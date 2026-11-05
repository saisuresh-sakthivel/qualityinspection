import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Batch } from "@/types/models";

interface BatchListProps {
  batches: Batch[];
}

/**
 * Lists seeded and newly created batches with a link into the inspection flow.
 */
export async function BatchList({ batches }: BatchListProps) {
  const t = await getTranslations("Batch");

  if (batches.length === 0) {
    return <p>{t("empty")}</p>;
  }

  return (
    <ul className="stack">
      {batches.map((batch) => (
        <li key={batch.id} className="card">
          <strong>{batch.id}</strong>
          <p>
            {batch.productName} · {batch.productionLine}
          </p>
          <Link href={`/inspections/new?batchId=${batch.id}`}>{t("inspect")}</Link>
        </li>
      ))}
    </ul>
  );
}
