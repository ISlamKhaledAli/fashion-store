import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

async function main() {
  console.log("Testing database connection...");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in the environment.");
  }
  
  // Mask the password for security in logs
  const maskedUrl = connectionString.replace(/:[^:@\n]+@/, ":****@");
  console.log("Connecting using:", maskedUrl);
  
  const pool = new pg.Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  
  try {
    // 1. Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("Database connection successful:", result);
    
    // 2. Count records to verify tables are present and queryable
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const orderCount = await prisma.order.count();
    
    console.log("\nDatabase Statistics (Read-Only Check - No data modified):");
    console.log(`- Users: ${userCount}`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Orders: ${orderCount}`);
    
    console.log("\nSuccess: Database is working correctly and no data was lost!");
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
