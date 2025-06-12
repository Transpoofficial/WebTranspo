-- AlterTable
ALTER TABLE `user` ADD COLUMN `resetPasswordExpiry` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordToken` VARCHAR(191) NULL;
