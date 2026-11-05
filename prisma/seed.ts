import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

/** Demo users used by the lightweight role switcher (brief §4). */
const USERS = [
  {
    id: "user_qe_priya",
    name: "Priya Singh",
    role: UserRole.QUALITY_ENGINEER,
  },
  {
    id: "user_ps_alex",
    name: "Alex Chen",
    role: UserRole.PRODUCTION_SUPERVISOR,
  },
] as const;

/**
 * Example batches for Step 1 — attach inspections to these IDs.
 * BATCH-001 matches the brief; BATCH-002 is a second fixture for multi-batch demos.
 */
const BATCHES = [
  {
    id: "BATCH-001",
    productName: "Steel Bracket — Model X200",
    productionLine: "Line 3",
  },
  {
    id: "BATCH-002",
    productName: "Aluminum Housing — Model H50",
    productionLine: "Line 1",
  },
] as const;

/**
 * Upserts seeded users so re-running the script is safe.
 */
async function seedUsers() {
  for (const user of USERS) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { name: user.name, role: user.role },
      create: { id: user.id, name: user.name, role: user.role },
    });
  }
}

/**
 * Upserts seeded batches from the Step 1 fixture set.
 */
async function seedBatches() {
  for (const batch of BATCHES) {
    await prisma.batch.upsert({
      where: { id: batch.id },
      update: {
        productName: batch.productName,
        productionLine: batch.productionLine,
      },
      create: {
        id: batch.id,
        productName: batch.productName,
        productionLine: batch.productionLine,
      },
    });
  }
}

/**
 * Seeds demo users and batches required before the inspection flow.
 */
async function main() {
  await seedUsers();
  await seedBatches();

  console.log("Seed complete:");
  console.log(
    `  users: ${USERS.map((u) => `${u.name} (${u.role})`).join(", ")}`,
  );
  console.log(`  batches: ${BATCHES.map((b) => b.id).join(", ")}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
