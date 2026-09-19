import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the cleanup script.");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log("=== Starting Database Mock Data Cleanup ===");

  // 1. Identify test / dummy products (Classic Tee, Visible Product, Draft Product, Admin Product, or products with no images)
  const dummyProducts = await prisma.product.findMany({
    where: {
      OR: [
        { name: { in: ["Classic Tee", "Visible Product", "Draft Product", "Admin Product", "Test Product"] } },
        { slug: { startsWith: "classic-tee" } },
        { slug: { startsWith: "visible-product" } },
        { slug: { startsWith: "draft-product" } },
        { slug: { startsWith: "admin-product" } },
        { images: { none: {} } },
      ],
    },
    select: { id: true, name: true, slug: true },
  });

  console.log(`Found ${dummyProducts.length} dummy/imageless products to remove.`);
  const dummyProductIds = dummyProducts.map((p) => p.id);

  if (dummyProductIds.length > 0) {
    // Clean dependent records
    await prisma.cartItem.deleteMany({
      where: {
        OR: [
          { variant: { productId: { in: dummyProductIds } } },
        ],
      },
    });

    await prisma.orderItem.deleteMany({
      where: {
        productId: { in: dummyProductIds },
      },
    });

    await prisma.review.deleteMany({
      where: {
        productId: { in: dummyProductIds },
      },
    });

    await prisma.wishlist.deleteMany({
      where: {
        productId: { in: dummyProductIds },
      },
    });

    await prisma.variant.deleteMany({
      where: {
        productId: { in: dummyProductIds },
      },
    });

    await prisma.productImage.deleteMany({
      where: {
        productId: { in: dummyProductIds },
      },
    });

    const deletedProducts = await prisma.product.deleteMany({
      where: {
        id: { in: dummyProductIds },
      },
    });

    console.log(`Deleted ${deletedProducts.count} dummy products and their associated variants/items.`);
  }

  // 2. Identify duplicate/empty categories without images or with name "Tops" that have no products
  const emptyCategories = await prisma.category.findMany({
    where: {
      OR: [
        { image: null },
        { image: "" },
      ],
      products: { none: {} },
    },
    select: { id: true, name: true, slug: true },
  });

  console.log(`Found ${emptyCategories.length} empty/imageless categories to remove.`);
  if (emptyCategories.length > 0) {
    const deletedCategories = await prisma.category.deleteMany({
      where: {
        id: { in: emptyCategories.map((c) => c.id) },
      },
    });
    console.log(`Deleted ${deletedCategories.count} empty/duplicate categories.`);
  }

  // Check remaining counts
  const remainingProducts = await prisma.product.count();
  const remainingCategories = await prisma.category.count();
  const remainingBrands = await prisma.brand.count();

  console.log("\n=== Current Database State ===");
  console.log(`Products: ${remainingProducts}`);
  console.log(`Categories: ${remainingCategories}`);
  console.log(`Brands: ${remainingBrands}`);
  console.log("Cleanup completed successfully.");
}

main()
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
