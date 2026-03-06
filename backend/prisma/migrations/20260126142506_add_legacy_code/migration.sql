/*
  Warnings:

  - A unique constraint covering the columns `[legacyCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_legacyCode_key" ON "users"("legacyCode");
