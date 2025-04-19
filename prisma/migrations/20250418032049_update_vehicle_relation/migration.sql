/*
  Warnings:

  - You are about to drop the column `vehicleId` on the `transportationorder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `transportationorder` DROP FOREIGN KEY `TransportationOrder_vehicleId_fkey`;

-- DropIndex
DROP INDEX `TransportationOrder_vehicleId_fkey` ON `transportationorder`;

-- AlterTable
ALTER TABLE `transportationorder` DROP COLUMN `vehicleId`;

-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `transportationOrderId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_transportationOrderId_fkey` FOREIGN KEY (`transportationOrderId`) REFERENCES `TransportationOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
