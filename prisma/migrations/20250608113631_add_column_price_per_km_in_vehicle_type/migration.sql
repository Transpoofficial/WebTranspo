/*
  Warnings:

  - Added the required column `pricePerKm` to the `VehicleType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `vehicletype` ADD COLUMN `pricePerKm` DECIMAL(10, 2) NOT NULL;
