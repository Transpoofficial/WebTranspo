/*
  Warnings:

  - Added the required column `people` to the `PackageOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `packageorder` ADD COLUMN `people` JSON NOT NULL;
