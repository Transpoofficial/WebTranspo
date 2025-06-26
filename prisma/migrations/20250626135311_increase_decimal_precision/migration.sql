/*
  Warnings:

  - You are about to alter the column `totalPrice` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(12,2)`.
  - You are about to alter the column `totalIncome` on the `report` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.

*/
-- AlterTable
ALTER TABLE `payment` MODIFY `totalPrice` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `report` MODIFY `totalIncome` DECIMAL(15, 2) NOT NULL;
