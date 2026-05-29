import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

async function main() {
  console.log("Checking products and statuses...");
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        price: true,
      }
    });

    console.log("Found products in database:", products.length);
    console.log(products);

    const categories = await prisma.category.findMany();
    console.log("Found categories in database:", categories.length);
    console.log(categories.map(c => ({ id: c.id, name: c.name, status: c.status })));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
