/*
  Warnings:

  - You are about to drop the `transport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `tourpackage` DROP FOREIGN KEY `TourPackage_transportId_fkey`;

-- DropForeignKey
ALTER TABLE `transport` DROP FOREIGN KEY `Transport_vehicleTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `transportationorder` DROP FOREIGN KEY `TransportationOrder_transportId_fkey`;

-- DropIndex
DROP INDEX `TourPackage_transportId_fkey` ON `tourpackage`;

-- DropIndex
DROP INDEX `TransportationOrder_transportId_fkey` ON `transportationorder`;

-- DropTable
DROP TABLE `transport`;

-- CreateTable
CREATE TABLE `Vehicle` (
    `id` VARCHAR(191) NOT NULL,
    `vehicleTypeId` VARCHAR(191) NOT NULL,
    `seatCount` INTEGER NOT NULL,
    `ratePerKm` DECIMAL(10, 2) NOT NULL,
    `additionalDetails` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TransportationOrder` ADD CONSTRAINT `TransportationOrder_transportId_fkey` FOREIGN KEY (`transportId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_vehicleTypeId_fkey` FOREIGN KEY (`vehicleTypeId`) REFERENCES `VehicleType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TourPackage` ADD CONSTRAINT `TourPackage_transportId_fkey` FOREIGN KEY (`transportId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
