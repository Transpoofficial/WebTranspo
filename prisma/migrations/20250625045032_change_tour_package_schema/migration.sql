/*
  Warnings:

  - You are about to drop the column `advantages` on the `tourpackage` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `tourpackage` table. All the data in the column will be lost.
  - You are about to drop the column `durationDays` on the `tourpackage` table. All the data in the column will be lost.
  - You are about to drop the column `services` on the `tourpackage` table. All the data in the column will be lost.
  - Added the required column `excludes` to the `TourPackage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `includes` to the `TourPackage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_private` to the `TourPackage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itineraries` to the `TourPackage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxPersonCapacity` to the `TourPackage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minPersonCapacity` to the `TourPackage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requirements` to the `TourPackage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tickets` to the `TourPackage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tourpackage` DROP COLUMN `advantages`,
    DROP COLUMN `destination`,
    DROP COLUMN `durationDays`,
    DROP COLUMN `services`,
    ADD COLUMN `excludes` JSON NOT NULL,
    ADD COLUMN `includes` JSON NOT NULL,
    ADD COLUMN `is_private` BOOLEAN NOT NULL,
    ADD COLUMN `itineraries` JSON NOT NULL,
    ADD COLUMN `maxPersonCapacity` INTEGER NOT NULL,
    ADD COLUMN `minPersonCapacity` INTEGER NOT NULL,
    ADD COLUMN `requirements` JSON NOT NULL,
    ADD COLUMN `tickets` JSON NOT NULL;
