-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `role` ENUM('CUSTOMER', 'ADMIN', 'SUPER_ADMIN') NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `orderType` ENUM('TRANSPORT', 'TOUR') NOT NULL,
    `orderDate` DATETIME(3) NOT NULL,
    `orderStatus` ENUM('PENDING', 'CONFIRMED', 'CANCELED', 'REFUNDED') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `senderName` VARCHAR(191) NOT NULL,
    `transferDate` DATETIME(3) NOT NULL,
    `proofUrl` VARCHAR(191) NOT NULL,
    `paymentStatus` ENUM('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED') NOT NULL,
    `totalPrice` DECIMAL(10, 2) NOT NULL,
    `approvedByAdminId` VARCHAR(191) NULL,

    UNIQUE INDEX `Payment_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefundRequest` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `requestDate` DATETIME(3) NOT NULL,
    `refundStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    `approvedByAdminId` VARCHAR(191) NULL,

    UNIQUE INDEX `RefundRequest_paymentId_key`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransportationOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `departureDate` DATETIME(3) NOT NULL,
    `pickupTime` DATETIME(3) NOT NULL,
    `pickupLocation` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `passengerCount` INTEGER NOT NULL,
    `vehicleCount` INTEGER NOT NULL,
    `roundTrip` BOOLEAN NOT NULL,
    `transportId` VARCHAR(191) NOT NULL,
    `totalDistance` DOUBLE NOT NULL,

    UNIQUE INDEX `TransportationOrder_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Review_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PackageOrder_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transport` (
    `id` VARCHAR(191) NOT NULL,
    `vehicleTypeId` VARCHAR(191) NOT NULL,
    `seatCount` INTEGER NOT NULL,
    `ratePerKm` DECIMAL(10, 2) NOT NULL,
    `additionalDetails` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VehicleType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TourPackage` (
    `id` VARCHAR(191) NOT NULL,
    `transportId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `durationDays` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `advantages` VARCHAR(191) NOT NULL,
    `services` VARCHAR(191) NOT NULL,
    `photoUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_approvedByAdminId_fkey` FOREIGN KEY (`approvedByAdminId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefundRequest` ADD CONSTRAINT `RefundRequest_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefundRequest` ADD CONSTRAINT `RefundRequest_approvedByAdminId_fkey` FOREIGN KEY (`approvedByAdminId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransportationOrder` ADD CONSTRAINT `TransportationOrder_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransportationOrder` ADD CONSTRAINT `TransportationOrder_transportId_fkey` FOREIGN KEY (`transportId`) REFERENCES `Transport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageOrder` ADD CONSTRAINT `PackageOrder_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageOrder` ADD CONSTRAINT `PackageOrder_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `TourPackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transport` ADD CONSTRAINT `Transport_vehicleTypeId_fkey` FOREIGN KEY (`vehicleTypeId`) REFERENCES `VehicleType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TourPackage` ADD CONSTRAINT `TourPackage_transportId_fkey` FOREIGN KEY (`transportId`) REFERENCES `Transport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
