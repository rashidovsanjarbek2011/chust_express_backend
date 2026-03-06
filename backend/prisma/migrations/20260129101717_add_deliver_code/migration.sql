/*
  Warnings:

  - A unique constraint covering the columns `[deliverCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "originLat" DOUBLE PRECISION,
ADD COLUMN     "originLng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'UZS',
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'pcs';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deliverCode" TEXT,
ADD COLUMN     "isDelivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "vehicleType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_deliverCode_key" ON "users"("deliverCode");
