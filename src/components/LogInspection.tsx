import { LogInspectionDialog } from "@/components/LogInspectionDialog";
import { listUninspectedBatches } from "@/app/api/batches/route";
import { getCurrentUser } from "@/lib/auth";

/**
 * Renders the log-inspection control only for a Quality Engineer.
 * The dialog interaction stays in a client child; the role decision does not.
 */
export async function LogInspection() {
  const user = await getCurrentUser();
  if (user?.role !== "QUALITY_ENGINEER") {
    return null;
  }

  const batches = await listUninspectedBatches();
  return <LogInspectionDialog batches={batches} />;
}
