import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = [
    {
      name: "Super Admin",
      email: "superadmin@example.com",
      role: Role.SUPER_ADMIN,
      password: hashedPassword,
      fullName: "Super Admin User",
      phoneNumber: "1234567890",
    },
    {
      name: "Admin",
      email: "admin@example.com",
      role: Role.ADMIN,
      password: hashedPassword,
      fullName: "Admin User",
      phoneNumber: "0987654321",
    },
    {
      name: "User",
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
