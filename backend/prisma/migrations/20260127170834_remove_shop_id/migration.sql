/*
  Warnings:

  - You are about to drop the column `shopId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `shops` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_shopId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_shopId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_shopId_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "shopId";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "shopId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "shopId";

-- DropTable
DROP TABLE "shops";
