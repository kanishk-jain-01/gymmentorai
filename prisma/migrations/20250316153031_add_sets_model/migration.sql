/*
  Warnings:

  - You are about to drop the column `distance` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `reps` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `sets` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Exercise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "distance",
DROP COLUMN "duration",
DROP COLUMN "reps",
DROP COLUMN "sets",
DROP COLUMN "weight";

-- CreateTable
CREATE TABLE "Set" (
    "id" TEXT NOT NULL,
    "reps" INTEGER,
    "weight" DOUBLE PRECISION,
    "duration" INTEGER,
    "distance" DOUBLE PRECISION,
    "notes" TEXT,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
