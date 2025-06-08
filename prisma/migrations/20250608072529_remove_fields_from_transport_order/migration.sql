/*
  Warnings:

  - You are about to drop the column `destination` on the `destinationtransportation` table. All the data in the column will be lost.
  - You are about to drop the column `departureDate` on the `transportationorder` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `transportationorder` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLocation` on the `transportationorder` table. All the data in the column will be lost.
  - Added the required column `address` to the `DestinationTransportation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `destinationtransportation` DROP COLUMN `destination`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `departureDate` DATETIME(3) NULL,
    ADD COLUMN `isPickupLocation` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lat` DOUBLE NULL,
    ADD COLUMN `lng` DOUBLE NULL;

-- AlterTable
ALTER TABLE `transportationorder` DROP COLUMN `departureDate`,
    DROP COLUMN `destination`,
    DROP COLUMN `pickupLocation`;
