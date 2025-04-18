/*
  Warnings:

  - You are about to drop the column `orderDate` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `pickupTime` on the `transportationorder` table. All the data in the column will be lost.
  - Added the required column `derpartureDate` to the `PackageOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `orderDate`;

-- AlterTable
ALTER TABLE `packageorder` ADD COLUMN `derpartureDate` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `payment` MODIFY `proofUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transportationorder` DROP COLUMN `pickupTime`;
