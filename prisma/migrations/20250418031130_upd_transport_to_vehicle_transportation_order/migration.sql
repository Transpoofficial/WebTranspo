/*
  Warnings:

  - You are about to drop the column `transportId` on the `transportationorder` table. All the data in the column will be lost.
  - Added the required column `vehicleId` to the `TransportationOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `transportationorder` DROP FOREIGN KEY `TransportationOrder_transportId_fkey`;

-- DropIndex
DROP INDEX `TransportationOrder_transportId_fkey` ON `transportationorder`;

-- AlterTable
ALTER TABLE `transportationorder` DROP COLUMN `transportId`,
    ADD COLUMN `vehicleId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `TransportationOrder` ADD CONSTRAINT `TransportationOrder_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
