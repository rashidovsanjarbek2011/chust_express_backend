/*
  Warnings:

  - A unique constraint covering the columns `[uniqueCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "uniqueCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_uniqueCode_key" ON "users"("uniqueCode");
