import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Current users in database:", users);

  const email = "test@example.com";
  const password = "password";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: "Mayank",
        passwordHash,
      },
    });
    console.log("Created default user for portfolio login:", user);
  } else {
    console.log("Default user already exists:", existing);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
