/*
  Warnings:

  - You are about to alter the column `advantages` on the `tourpackage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `services` on the `tourpackage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `photoUrl` on the `tourpackage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `tourpackage` MODIFY `advantages` JSON NOT NULL,
    MODIFY `services` JSON NOT NULL,
    MODIFY `photoUrl` JSON NOT NULL;
