/*
  Warnings:

  - You are about to drop the column `transportId` on the `tourpackage` table. All the data in the column will be lost.
  - Added the required column `vehicleId` to the `TourPackage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tourpackage` DROP FOREIGN KEY `TourPackage_transportId_fkey`;

-- DropIndex
DROP INDEX `TourPackage_transportId_fkey` ON `tourpackage`;

-- AlterTable
ALTER TABLE `tourpackage` DROP COLUMN `transportId`,
    ADD COLUMN `vehicleId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `TourPackage` ADD CONSTRAINT `TourPackage_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
