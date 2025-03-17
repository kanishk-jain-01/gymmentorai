-- AlterTable
ALTER TABLE "User" ADD COLUMN     "distanceUnit" TEXT NOT NULL DEFAULT 'mi',
ADD COLUMN     "weightUnit" TEXT NOT NULL DEFAULT 'lb';
