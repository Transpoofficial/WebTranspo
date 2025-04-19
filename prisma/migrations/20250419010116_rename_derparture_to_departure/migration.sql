/*
  Warnings:

  - You are about to drop the column `derpartureDate` on the `packageorder` table. All the data in the column will be lost.
  - Added the required column `departureDate` to the `PackageOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `packageorder` DROP COLUMN `derpartureDate`,
    ADD COLUMN `departureDate` DATETIME(3) NOT NULL;
