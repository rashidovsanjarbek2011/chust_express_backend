/*
  Warnings:

  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DeliveryType" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "territoryId" INTEGER;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "image",
ADD COLUMN     "images" JSONB;

-- CreateTable
CREATE TABLE "Territory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "zoneType" TEXT,
    "description" TEXT,
    "geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Territory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerTerritory" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "territoryId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultPriority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerTerritory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderResource" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" INTEGER,
    "territoryId" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionEquipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstructionEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryVehicle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION,
    "plateNum" TEXT,
    "hourlyRate" DOUBLE PRECISION DEFAULT 0,
    "pricePerKm" DOUBLE PRECISION DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceVehicle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "equipment" TEXT,
    "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleTerritory" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "territoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleTerritory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkerTerritory_workerId_territoryId_key" ON "WorkerTerritory"("workerId", "territoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryVehicle_plateNum_key" ON "DeliveryVehicle"("plateNum");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleTerritory_vehicleId_territoryId_key" ON "VehicleTerritory"("vehicleId", "territoryId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerTerritory" ADD CONSTRAINT "WorkerTerritory_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerTerritory" ADD CONSTRAINT "WorkerTerritory_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderResource" ADD CONSTRAINT "OrderResource_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderResource" ADD CONSTRAINT "OrderResource_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleTerritory" ADD CONSTRAINT "VehicleTerritory_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "Territory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
