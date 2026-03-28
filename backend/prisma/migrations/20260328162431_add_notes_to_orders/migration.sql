/*
  Warnings:

  - You are about to drop the column `notes` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "notes",
ADD COLUMN     "preferredCourierId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deliveryPrice" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "isPaused" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "workingRegion" TEXT;
