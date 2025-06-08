/*
  Warnings:

  - You are about to drop the column `destinationName` on the `destinationtransportation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `VehicleType_name_key` ON `vehicletype`;

-- AlterTable
ALTER TABLE `destinationtransportation` DROP COLUMN `destinationName`,
    ADD COLUMN `arrivalTime` VARCHAR(191) NULL,
    ADD COLUMN `destination` JSON NOT NULL,
    ADD COLUMN `sequence` INTEGER NOT NULL DEFAULT 0;
