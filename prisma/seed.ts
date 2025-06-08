import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

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

  // Seed vehicle types
  const vehicleTypes = [
    { name: "Angkot" },
    { name: "Hiace Commuter" },
    { name: "Hiace Premio" },
    { name: "ELF" },
  ];

  for (const vehicleType of vehicleTypes) {
    await prisma.vehicleType.upsert({
      where: { name: vehicleType.name },
      update: {},
      create: {
        name: vehicleType.name,
      },
    });
  }

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
