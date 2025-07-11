import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash(
    process.env.ACCOUNT_DEFAULT_PASSWORD || "password123",
    10
  );

  const users = [
    {
      email: "superadmin@example.com",
      role: Role.SUPER_ADMIN,
      password: hashedPassword,
      fullName: "Super Admin User",
      phoneNumber: "1234567890",
    },
    {
      email: "admin@example.com",
      role: Role.ADMIN,
      password: hashedPassword,
      fullName: "Admin User",
      phoneNumber: "0987654321",
    },
    {
      email: "user@example.com",
      role: Role.CUSTOMER,
      password: hashedPassword,
      fullName: "Regular User",
      phoneNumber: "1122334455",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: user.password,
        role: user.role,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
      },
    });
  }
  // Seed vehicle types with capacity
  const vehicleTypes = [
    {
      name: "Angkot",
      capacity: 12,
      pricePerKm: 4100,
    },
    {
      name: "Hiace Commuter",
      capacity: 15,
      pricePerKm: 2500,
    },
    {
      name: "Hiace Premio",
      capacity: 14,
      pricePerKm: 25000,
    },
    {
      name: "Elf",
      capacity: 19,
      pricePerKm: 2500,
    },
  ];

  for (const vehicleType of vehicleTypes) {
    const existing = await prisma.vehicleType.findFirst({
      where: { name: vehicleType.name },
    });

    if (existing) {
      await prisma.vehicleType.update({
        where: { id: existing.id },
        data: {
          capacity: vehicleType.capacity,
          pricePerKm: vehicleType.pricePerKm,
        },
      });
    } else {
      await prisma.vehicleType.create({
        data: {
          name: vehicleType.name,
          capacity: vehicleType.capacity,
          pricePerKm: vehicleType.pricePerKm,
        },
      });
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
