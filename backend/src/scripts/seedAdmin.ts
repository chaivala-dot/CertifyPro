import { prisma } from "../db.js";
import { hashPassword } from "../utils/password.js";

async function main() {
  const email = "admin@certifypro.com";
  const password = "password";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`User with email ${email} already exists (id=${existing.id}).`);
    return;
  }

  const passwordHash = hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name: "Admin User",
      passwordHash,
    },
  });

  console.log("Created admin user:", {
    id: user.id,
    email: user.email,
    name: user.name,
  });
}

main()
  .catch((err) => {
    console.error("Failed to seed admin user:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

