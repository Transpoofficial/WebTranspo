-- DropForeignKey
ALTER TABLE `tourpackage` DROP FOREIGN KEY `TourPackage_vehicleId_fkey`;

-- DropIndex
DROP INDEX `TourPackage_vehicleId_fkey` ON `tourpackage`;

-- AddForeignKey
ALTER TABLE `TourPackage` ADD CONSTRAINT `TourPackage_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `VehicleType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
