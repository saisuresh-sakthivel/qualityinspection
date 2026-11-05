import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

/** Demo logins. Passwords are hashed before insert. */
const USERS = [
  {
    id: "user_qe_priya",
    username: "priya",
    name: "Priya Singh",
    password: "engineer",
    role: UserRole.QUALITY_ENGINEER,
  },
  {
    id: "user_ps_alex",
    username: "alex",
    name: "Alex Chen",
    password: "supervisor",
    role: UserRole.PRODUCTION_SUPERVISOR,
  },
] as const;

/**
 * Step 1 fixtures. BATCH-001 matches the requirement example.
 * BATCH-002 is the second batch so inspections can be attached to more than one line.
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
 * Upserts seeded users so re-running the script refreshes credentials.
 */
async function seedUsers() {
  for (const user of USERS) {
    const passwordHash = hashPassword(user.password);
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        username: user.username,
        name: user.name,
        role: user.role,
        passwordHash,
      },
      create: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        passwordHash,
      },
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
 * Seeds demo users and batches required before login and inspection.
 */
async function main() {
  await seedUsers();
  await seedBatches();

  console.log("Seed complete:");
  console.log(
    `  users: ${USERS.map((user) => `${user.username} (${user.role})`).join(", ")}`,
  );
  console.log(`  batches: ${BATCHES.map((batch) => batch.id).join(", ")}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
