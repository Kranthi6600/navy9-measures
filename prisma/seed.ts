import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";
import "dotenv/config"; // Ensures it can read your .env file

const connectionString = process.env.DATABASE_URL;

// Initialize Prisma with the required driver adapter
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL || "navy9fl@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "navy9";

  const passwordHash = await bcrypt.hash(password, 10);

  // Create or update the admin user
  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      name: "Admin",
    },
  });

  console.log(`✅ Admin user created/updated: ${admin.email}`);
  console.log(`🔑 Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect properly from the database
    await prisma.$disconnect();
    await pool.end();
  });