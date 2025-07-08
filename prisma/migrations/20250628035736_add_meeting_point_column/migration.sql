/*
  Warnings:

  - Added the required column `description` to the `TourPackage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meetingPoint` to the `TourPackage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tourpackage` ADD COLUMN `description` TEXT NOT NULL,
    ADD COLUMN `meetingPoint` VARCHAR(191) NOT NULL,
    MODIFY `tickets` JSON NULL;
