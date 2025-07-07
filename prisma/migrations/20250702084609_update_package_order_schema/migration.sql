/*
  Warnings:

  - Made the column `people` on table `packageorder` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `packageorder` MODIFY `people` INTEGER NOT NULL;
