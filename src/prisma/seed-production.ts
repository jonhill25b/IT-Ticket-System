import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    console.log(`Database already has ${userCount} user(s). Skipping production seed.`);
    return;
  }

  console.log("No users found. Creating default admin account...");

  const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  const pw = await bcrypt.hash("admin123", salt);

  const admin = await prisma.user.create({
    data: {
      email: "admin@local.dev",
      password: pw,
      name: "Admin",
      role: Role.ADMIN,
    },
  });

  console.log(`Created default admin: ${admin.email}`);
  console.log("Default password: admin123");
  console.log("IMPORTANT: Change this password after first login!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
