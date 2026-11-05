-- Existing seeded users need values before the columns can be required.
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

UPDATE "User" SET "username" = 'priya' WHERE "id" = 'user_qe_priya';
UPDATE "User" SET "username" = 'alex' WHERE "id" = 'user_ps_alex';
UPDATE "User" SET "username" = "id" WHERE "username" IS NULL;
UPDATE "User" SET "passwordHash" = 'pending' WHERE "passwordHash" IS NULL;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
