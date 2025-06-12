/*
  Warnings:

  - Added the required column `capacity` to the `VehicleType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `vehicletype` ADD COLUMN `capacity` INTEGER NOT NULL;
