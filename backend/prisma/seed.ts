import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { OrderStatus, PaymentStatus, PrismaClient, Role } from "@prisma/client";
import pg from "pg";
import { hashPassword } from "../src/utils/bcrypt";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const ADMIN_CREDENTIALS = {
  name: "Fashion Store Admin",
  email: "admin@fashion-store.dev",
  password: "Admin@123456",
};

const CUSTOMER_ACCOUNTS = [
  {
    name: "Sarah Bennett",
    email: "sarah@fashion-store.dev",
    password: "Customer@123",
    phone: "+201000000001",
  },
  {
    name: "Omar Khaled",
    email: "omar@fashion-store.dev",
    password: "Customer@123",
    phone: "+201000000002",
  },
  {
    name: "Layla Nasser",
    email: "layla@fashion-store.dev",
    password: "Customer@123",
    phone: "+201000000003",
  },
];

const IMAGE_LIBRARY = {
  hero:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
  sneakersStudio:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  sneakersStreet:
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
  topsStudio:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  topsStreet:
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
  denimStudio:
    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80",
  denimStreet:
    "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=1200&q=80",
  outerwearStudio:
    "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1200&q=80",
  outerwearStreet:
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80",
  accessoriesStudio:
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
  accessoriesStreet:
    "https://images.unsplash.com/photo-1575425186775-b8de9a427e67?auto=format&fit=crop&w=1200&q=80",
} as const;

const BRAND_LOGOS = {
  nike: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
  adidas: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
  puma:
    "https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Puma_AG.svg/512px-Puma_AG.svg.png",
  levis: "https://upload.wikimedia.org/wikipedia/commons/9/91/Levi%27s_logo.svg",
  zara: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg",
} as const;

const CATEGORY_SEEDS = [
  { name: "Sneakers", slug: "sneakers", image: IMAGE_LIBRARY.sneakersStudio },
  { name: "Tops", slug: "tops", image: IMAGE_LIBRARY.topsStudio },
  { name: "Denim", slug: "denim", image: IMAGE_LIBRARY.denimStudio },
  { name: "Outerwear", slug: "outerwear", image: IMAGE_LIBRARY.outerwearStudio },
  { name: "Accessories", slug: "accessories", image: IMAGE_LIBRARY.accessoriesStudio },
];

const BRAND_SEEDS = [
  { name: "Nike", slug: "nike", logo: BRAND_LOGOS.nike },
  { name: "Adidas", slug: "adidas", logo: BRAND_LOGOS.adidas },
  { name: "Puma", slug: "puma", logo: BRAND_LOGOS.puma },
  { name: "Levi's", slug: "levis", logo: BRAND_LOGOS.levis },
  { name: "Zara", slug: "zara", logo: BRAND_LOGOS.zara },
];

const TAG_NAMES = [
  "Best Seller",
  "New Season",
  "Tailored",
  "Minimal",
  "Travel Ready",
  "Limited Run",
];

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  cost: number;
  categorySlug: string;
  brandSlug: string;
  featured: boolean;
  imageUrls: string[];
  tagNames: string[];
  variants: Array<{
    size: string;
    color: string;
    colorHex: string;
    stock: number;
    sku: string;
  }>;
};

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    name: "Nike Air Max 90",
    slug: "nike-air-max-90",
    description:
      "Classic Nike running-inspired sneaker with visible Air cushioning and everyday comfort.",
    price: 149,
    comparePrice: 179,
    cost: 88,
    categorySlug: "sneakers",
    brandSlug: "nike",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.sneakersStudio, IMAGE_LIBRARY.sneakersStreet],
    tagNames: ["Best Seller", "New Season"],
    variants: [
      { size: "41", color: "White/Red", colorHex: "#F4F4F4", stock: 12, sku: "SEED-NIKE-AM90-41-WHITE" },
      { size: "42", color: "White/Red", colorHex: "#F4F4F4", stock: 10, sku: "SEED-NIKE-AM90-42-WHITE" },
      { size: "43", color: "White/Red", colorHex: "#F4F4F4", stock: 8, sku: "SEED-NIKE-AM90-43-WHITE" },
    ],
  },
  {
    name: "Adidas Superstar",
    slug: "adidas-superstar",
    description:
      "Iconic Adidas shell-toe sneaker in premium leather with a timeless streetwear silhouette.",
    price: 129,
    comparePrice: 159,
    cost: 74,
    categorySlug: "sneakers",
    brandSlug: "adidas",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.sneakersStreet, IMAGE_LIBRARY.sneakersStudio],
    tagNames: ["Best Seller", "Minimal"],
    variants: [
      { size: "41", color: "White/Black", colorHex: "#F8F8F8", stock: 14, sku: "SEED-ADIDAS-SUPERSTAR-41-WHITE" },
      { size: "42", color: "White/Black", colorHex: "#F8F8F8", stock: 13, sku: "SEED-ADIDAS-SUPERSTAR-42-WHITE" },
      { size: "43", color: "White/Black", colorHex: "#F8F8F8", stock: 9, sku: "SEED-ADIDAS-SUPERSTAR-43-WHITE" },
    ],
  },
  {
    name: "Puma RS-X Efekt",
    slug: "puma-rsx-efekt",
    description:
      "Bold Puma sneaker with chunky RS midsole and mixed-material upper for statement styling.",
    price: 139,
    comparePrice: 169,
    cost: 79,
    categorySlug: "sneakers",
    brandSlug: "puma",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.sneakersStudio, IMAGE_LIBRARY.hero],
    tagNames: ["New Season", "Travel Ready"],
    variants: [
      { size: "40", color: "White/Blue", colorHex: "#F0F4FA", stock: 9, sku: "SEED-PUMA-RSX-40-WHITE" },
      { size: "41", color: "White/Blue", colorHex: "#F0F4FA", stock: 8, sku: "SEED-PUMA-RSX-41-WHITE" },
      { size: "42", color: "White/Blue", colorHex: "#F0F4FA", stock: 7, sku: "SEED-PUMA-RSX-42-WHITE" },
    ],
  },
  {
    name: "Nike Dri-FIT Club Tee",
    slug: "nike-dri-fit-club-tee",
    description:
      "Breathable Dri-FIT t-shirt for daily wear and light training sessions.",
    price: 39,
    comparePrice: 49,
    cost: 18,
    categorySlug: "tops",
    brandSlug: "nike",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.topsStudio, IMAGE_LIBRARY.topsStreet],
    tagNames: ["Best Seller", "Minimal"],
    variants: [
      { size: "S", color: "Black", colorHex: "#111111", stock: 20, sku: "SEED-NIKE-TEE-S-BLACK" },
      { size: "M", color: "Black", colorHex: "#111111", stock: 18, sku: "SEED-NIKE-TEE-M-BLACK" },
      { size: "L", color: "Black", colorHex: "#111111", stock: 14, sku: "SEED-NIKE-TEE-L-BLACK" },
    ],
  },
  {
    name: "Adidas Essentials Trefoil Tee",
    slug: "adidas-essentials-trefoil-tee",
    description:
      "Soft cotton t-shirt with classic Trefoil branding and relaxed everyday fit.",
    price: 35,
    comparePrice: 45,
    cost: 16,
    categorySlug: "tops",
    brandSlug: "adidas",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.topsStreet, IMAGE_LIBRARY.topsStudio],
    tagNames: ["Minimal", "Travel Ready"],
    variants: [
      { size: "S", color: "White", colorHex: "#F6F6F6", stock: 16, sku: "SEED-ADIDAS-TEE-S-WHITE" },
      { size: "M", color: "White", colorHex: "#F6F6F6", stock: 15, sku: "SEED-ADIDAS-TEE-M-WHITE" },
      { size: "L", color: "White", colorHex: "#F6F6F6", stock: 11, sku: "SEED-ADIDAS-TEE-L-WHITE" },
    ],
  },
  {
    name: "Zara Oversized Cotton Hoodie",
    slug: "zara-oversized-cotton-hoodie",
    description:
      "Oversized brushed-cotton hoodie with dropped shoulders and clean monochrome finish.",
    price: 59,
    comparePrice: 75,
    cost: 27,
    categorySlug: "tops",
    brandSlug: "zara",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.topsStreet, IMAGE_LIBRARY.outerwearStreet],
    tagNames: ["Best Seller", "New Season"],
    variants: [
      { size: "S", color: "Beige", colorHex: "#CDBBA2", stock: 12, sku: "SEED-ZARA-HOODIE-S-BEIGE" },
      { size: "M", color: "Beige", colorHex: "#CDBBA2", stock: 11, sku: "SEED-ZARA-HOODIE-M-BEIGE" },
      { size: "L", color: "Beige", colorHex: "#CDBBA2", stock: 8, sku: "SEED-ZARA-HOODIE-L-BEIGE" },
    ],
  },
  {
    name: "Levi's 501 Original Jeans",
    slug: "levis-501-original-jeans",
    description:
      "Straight-leg Levi's denim with classic button fly and rigid vintage-inspired feel.",
    price: 98,
    comparePrice: 120,
    cost: 49,
    categorySlug: "denim",
    brandSlug: "levis",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.denimStudio, IMAGE_LIBRARY.denimStreet],
    tagNames: ["Best Seller", "Tailored"],
    variants: [
      { size: "30", color: "Vintage Blue", colorHex: "#4A5D7B", stock: 13, sku: "SEED-LEVIS-501-30-BLUE" },
      { size: "32", color: "Vintage Blue", colorHex: "#4A5D7B", stock: 12, sku: "SEED-LEVIS-501-32-BLUE" },
      { size: "34", color: "Vintage Blue", colorHex: "#4A5D7B", stock: 8, sku: "SEED-LEVIS-501-34-BLUE" },
    ],
  },
  {
    name: "Levi's 512 Slim Taper Jeans",
    slug: "levis-512-slim-taper-jeans",
    description:
      "Modern slim-taper Levi's fit with stretch denim for comfortable all-day movement.",
    price: 104,
    comparePrice: 129,
    cost: 53,
    categorySlug: "denim",
    brandSlug: "levis",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.denimStreet, IMAGE_LIBRARY.denimStudio],
    tagNames: ["Tailored", "New Season"],
    variants: [
      { size: "30", color: "Dark Indigo", colorHex: "#23314B", stock: 10, sku: "SEED-LEVIS-512-30-INDIGO" },
      { size: "32", color: "Dark Indigo", colorHex: "#23314B", stock: 9, sku: "SEED-LEVIS-512-32-INDIGO" },
      { size: "34", color: "Dark Indigo", colorHex: "#23314B", stock: 6, sku: "SEED-LEVIS-512-34-INDIGO" },
    ],
  },
  {
    name: "Nike Windrunner Jacket",
    slug: "nike-windrunner-jacket",
    description:
      "Lightweight zip jacket inspired by the classic Windrunner profile with breathable lining.",
    price: 125,
    comparePrice: 155,
    cost: 68,
    categorySlug: "outerwear",
    brandSlug: "nike",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.outerwearStudio, IMAGE_LIBRARY.outerwearStreet],
    tagNames: ["Travel Ready", "Best Seller"],
    variants: [
      { size: "S", color: "Black", colorHex: "#1A1A1A", stock: 8, sku: "SEED-NIKE-WINDRUNNER-S-BLACK" },
      { size: "M", color: "Black", colorHex: "#1A1A1A", stock: 9, sku: "SEED-NIKE-WINDRUNNER-M-BLACK" },
      { size: "L", color: "Black", colorHex: "#1A1A1A", stock: 6, sku: "SEED-NIKE-WINDRUNNER-L-BLACK" },
    ],
  },
  {
    name: "Adidas Firebird Track Jacket",
    slug: "adidas-firebird-track-jacket",
    description:
      "Retro Firebird track jacket in smooth tricot with classic 3-stripes detailing.",
    price: 89,
    comparePrice: 109,
    cost: 45,
    categorySlug: "outerwear",
    brandSlug: "adidas",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.outerwearStreet, IMAGE_LIBRARY.outerwearStudio],
    tagNames: ["New Season", "Minimal"],
    variants: [
      { size: "S", color: "Navy", colorHex: "#1C2D52", stock: 10, sku: "SEED-ADIDAS-FIREBIRD-S-NAVY" },
      { size: "M", color: "Navy", colorHex: "#1C2D52", stock: 9, sku: "SEED-ADIDAS-FIREBIRD-M-NAVY" },
      { size: "L", color: "Navy", colorHex: "#1C2D52", stock: 7, sku: "SEED-ADIDAS-FIREBIRD-L-NAVY" },
    ],
  },
  {
    name: "Zara Crossbody City Bag",
    slug: "zara-crossbody-city-bag",
    description:
      "Structured crossbody bag with adjustable strap and minimal hardware for city use.",
    price: 55,
    comparePrice: 69,
    cost: 24,
    categorySlug: "accessories",
    brandSlug: "zara",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.accessoriesStudio, IMAGE_LIBRARY.accessoriesStreet],
    tagNames: ["Minimal", "Travel Ready"],
    variants: [
      { size: "One Size", color: "Black", colorHex: "#101010", stock: 15, sku: "SEED-ZARA-BAG-ONE-BLACK" },
    ],
  },
  {
    name: "Puma Essentials Baseball Cap",
    slug: "puma-essentials-baseball-cap",
    description:
      "Everyday cotton-twill cap with curved brim and embroidered Puma logo.",
    price: 28,
    comparePrice: 36,
    cost: 12,
    categorySlug: "accessories",
    brandSlug: "puma",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.accessoriesStreet, IMAGE_LIBRARY.accessoriesStudio],
    tagNames: ["Best Seller", "Limited Run"],
    variants: [
      { size: "One Size", color: "Black", colorHex: "#121212", stock: 18, sku: "SEED-PUMA-CAP-ONE-BLACK" },
    ],
  },
];

const ADDRESS_SEEDS = [
  {
    email: "sarah@fashion-store.dev",
    label: "[Seed] Home",
    firstName: "Sarah",
    lastName: "Bennett",
    street: "12 River Walk",
    apartment: "Apt 6B",
    city: "Cairo",
    state: "Cairo",
    zip: "11511",
    country: "EG",
    isDefault: true,
  },
  {
    email: "omar@fashion-store.dev",
    label: "[Seed] Loft",
    firstName: "Omar",
    lastName: "Khaled",
    street: "48 Palm Avenue",
    apartment: "Suite 14",
    city: "Alexandria",
    state: "Alexandria",
    zip: "21500",
    country: "EG",
    isDefault: true,
  },
  {
    email: "layla@fashion-store.dev",
    label: "[Seed] Studio",
    firstName: "Layla",
    lastName: "Nasser",
    street: "7 Garden Heights",
    apartment: "Floor 2",
    city: "Giza",
    state: "Giza",
    zip: "12511",
    country: "EG",
    isDefault: true,
  },
];

const REVIEW_SEEDS = [
  {
    email: "sarah@fashion-store.dev",
    productSlug: "nike-air-max-90",
    rating: 5,
    title: "Classic and comfy",
    body: "Great cushioning and shape. I wear them daily and they still feel premium.",
  },
  {
    email: "omar@fashion-store.dev",
    productSlug: "levis-501-original-jeans",
    rating: 4,
    title: "Solid denim fit",
    body: "Exactly the cut I expected from 501. Durable fabric and clean vintage wash.",
  },
  {
    email: "layla@fashion-store.dev",
    productSlug: "zara-crossbody-city-bag",
    rating: 5,
    title: "Perfect city bag",
    body: "Looks elegant and fits all my daily essentials without feeling bulky.",
  },
  {
    email: "sarah@fashion-store.dev",
    productSlug: "adidas-superstar",
    rating: 4,
    title: "Timeless pair",
    body: "Very versatile and comfortable for long walks. Easy to style with denim.",
  },
];

const WISHLIST_SEEDS = [
  { email: "sarah@fashion-store.dev", productSlug: "zara-crossbody-city-bag" },
  { email: "omar@fashion-store.dev", productSlug: "nike-windrunner-jacket" },
  { email: "layla@fashion-store.dev", productSlug: "levis-512-slim-taper-jeans" },
];

const ORDER_SEEDS = [
  {
    email: "sarah@fashion-store.dev",
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    stripePaymentId: "pi_seed_sarah_paid",
    notes: "[seed] Delivered mixed sneakers + denim order",
    createdAt: daysAgo(10),
    items: [
      { sku: "SEED-NIKE-AM90-42-WHITE", quantity: 1 },
      { sku: "SEED-LEVIS-501-32-BLUE", quantity: 1 },
    ],
  },
  {
    email: "omar@fashion-store.dev",
    status: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.PAID,
    stripePaymentId: "pi_seed_omar_today",
    notes: "[seed] Same-day paid sneakers order",
    createdAt: hoursAgo(5),
    items: [{ sku: "SEED-ADIDAS-SUPERSTAR-43-WHITE", quantity: 1 }],
  },
  {
    email: "layla@fashion-store.dev",
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    stripePaymentId: null,
    notes: "[seed] Pending accessories order",
    createdAt: daysAgo(2),
    items: [
      { sku: "SEED-ZARA-BAG-ONE-BLACK", quantity: 1 },
      { sku: "SEED-PUMA-CAP-ONE-BLACK", quantity: 1 },
    ],
  },
];

const DISCOUNT_SEEDS = [
  {
    code: "WELCOME10",
    type: "PERCENTAGE",
    value: 10,
    minOrder: 100,
    maxUses: 100,
    expiresAt: daysFromNow(45),
    isActive: true,
  },
  {
    code: "SPRING25",
    type: "FIXED",
    value: 25,
    minOrder: 180,
    maxUses: 50,
    expiresAt: daysFromNow(30),
    isActive: true,
  },
];

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function hoursAgo(hours: number) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function upsertUser(params: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
}) {
  const hashedPassword = await hashPassword(params.password);

  return prisma.user.upsert({
    where: { email: params.email },
    update: {
      name: params.name,
      phone: params.phone,
      password: hashedPassword,
      role: params.role,
    },
    create: {
      name: params.name,
      email: params.email,
      phone: params.phone,
      password: hashedPassword,
      role: params.role,
    },
  });
}

async function main() {
  const admin = await upsertUser({ ...ADMIN_CREDENTIALS, role: "ADMIN" });

  const customers = new Map<string, Awaited<ReturnType<typeof upsertUser>>>();
  for (const customer of CUSTOMER_ACCOUNTS) {
    const user = await upsertUser({ ...customer, role: "CUSTOMER" });
    customers.set(customer.email, user);
  }

  const categoryMap = new Map<string, { id: string; slug: string }>();
  for (const category of CATEGORY_SEEDS) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, image: category.image, parentId: null },
      create: { ...category, parentId: null },
    });
    categoryMap.set(category.slug, { id: record.id, slug: record.slug });
  }

  const brandMap = new Map<string, { id: string; slug: string }>();
  for (const brand of BRAND_SEEDS) {
    const record = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, logo: brand.logo },
      create: brand,
    });
    brandMap.set(brand.slug, { id: record.id, slug: record.slug });
  }

  const tagMap = new Map<string, string>();
  for (const name of TAG_NAMES) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tagMap.set(name, tag.id);
  }

  const productMap = new Map<string, { id: string; price: number }>();
  const variantMap = new Map<
    string,
    { id: string; productId: string; price: number }
  >();

  for (const product of PRODUCT_SEEDS) {
    const categoryId = categoryMap.get(product.categorySlug)?.id;
    const brandId = brandMap.get(product.brandSlug)?.id;

    if (!categoryId || !brandId) {
      throw new Error(`Missing category or brand for product ${product.slug}`);
    }

    const productRecord = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice ?? null,
        cost: product.cost,
        categoryId,
        brandId,
        status: "ACTIVE",
        featured: product.featured,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice ?? null,
        cost: product.cost,
        categoryId,
        brandId,
        status: "ACTIVE",
        featured: product.featured,
      },
    });

    await prisma.productImage.deleteMany({
      where: { productId: productRecord.id },
    });

    await prisma.productImage.createMany({
      data: product.imageUrls.map((url, index) => ({
        productId: productRecord.id,
        url,
        publicId: `${product.slug}-image-${index + 1}`,
        position: index,
        isMain: index === 0,
      })),
    });

    for (const variant of product.variants) {
      const variantRecord = await prisma.variant.upsert({
        where: { sku: variant.sku },
        update: {
          productId: productRecord.id,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          stock: variant.stock,
        },
        create: {
          productId: productRecord.id,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          stock: variant.stock,
          sku: variant.sku,
        },
      });

      variantMap.set(variant.sku, {
        id: variantRecord.id,
        productId: productRecord.id,
        price: product.price,
      });
    }

    await prisma.productTag.deleteMany({
      where: { productId: productRecord.id },
    });

    await prisma.productTag.createMany({
      data: product.tagNames.map((tagName) => {
        const tagId = tagMap.get(tagName);
        if (!tagId) {
          throw new Error(`Missing tag ${tagName}`);
        }

        return {
          productId: productRecord.id,
          tagId,
        };
      }),
    });

    productMap.set(product.slug, {
      id: productRecord.id,
      price: product.price,
    });
  }

  const customerIds = Array.from(customers.values()).map((user) => user.id);
  const productIds = Array.from(productMap.values()).map(
    (product) => product.id,
  );

  await prisma.order.deleteMany({
    where: {
      userId: { in: customerIds },
      notes: { startsWith: "[seed]" },
    },
  });

  await prisma.review.deleteMany({
    where: {
      userId: { in: customerIds },
      productId: { in: productIds },
    },
  });

  await prisma.wishlist.deleteMany({
    where: {
      userId: { in: customerIds },
      productId: { in: productIds },
    },
  });

  await prisma.address.deleteMany({
    where: {
      userId: { in: customerIds },
      label: { startsWith: "[Seed]" },
    },
  });

  const existingCarts = await prisma.cart.findMany({
    where: { userId: { in: customerIds } },
    select: { id: true },
  });

  if (existingCarts.length > 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: { in: existingCarts.map((cart) => cart.id) } },
    });
  }

  const addressMap = new Map<string, string>();
  for (const address of ADDRESS_SEEDS) {
    const user = customers.get(address.email);
    if (!user) {
      throw new Error(`Missing customer for address ${address.email}`);
    }

    const record = await prisma.address.create({
      data: {
        userId: user.id,
        label: address.label,
        firstName: address.firstName,
        lastName: address.lastName,
        street: address.street,
        apartment: address.apartment,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        isDefault: address.isDefault,
      },
    });

    addressMap.set(address.email, record.id);
  }

  await prisma.review.createMany({
    data: REVIEW_SEEDS.map((review) => {
      const user = customers.get(review.email);
      const product = productMap.get(review.productSlug);

      if (!user || !product) {
        throw new Error(
          `Missing review dependency for ${review.email} / ${review.productSlug}`,
        );
      }

      return {
        userId: user.id,
        productId: product.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
      };
    }),
  });

  await prisma.wishlist.createMany({
    data: WISHLIST_SEEDS.map((entry) => {
      const user = customers.get(entry.email);
      const product = productMap.get(entry.productSlug);

      if (!user || !product) {
        throw new Error(
          `Missing wishlist dependency for ${entry.email} / ${entry.productSlug}`,
        );
      }

      return {
        userId: user.id,
        productId: product.id,
      };
    }),
  });

  const layla = customers.get("layla@fashion-store.dev");
  if (!layla) {
    throw new Error("Layla seed user was not created.");
  }

  await prisma.cart.upsert({
    where: { userId: layla.id },
    update: {
      items: {
        deleteMany: {},
        create: [
          {
            variantId: variantMap.get("SEED-ZARA-HOODIE-M-BEIGE")?.id as string,
            quantity: 1,
          },
          {
            variantId: variantMap.get("SEED-PUMA-RSX-40-WHITE")?.id as string,
            quantity: 1,
          },
        ],
      },
    },
    create: {
      userId: layla.id,
      items: {
        create: [
          {
            variantId: variantMap.get("SEED-ZARA-HOODIE-M-BEIGE")?.id as string,
            quantity: 1,
          },
          {
            variantId: variantMap.get("SEED-PUMA-RSX-40-WHITE")?.id as string,
            quantity: 1,
          },
        ],
      },
    },
  });

  for (const orderSeed of ORDER_SEEDS) {
    const user = customers.get(orderSeed.email);
    const addressId = addressMap.get(orderSeed.email);

    if (!user || !addressId) {
      throw new Error(`Missing order dependency for ${orderSeed.email}`);
    }

    const lineItems = orderSeed.items.map((item) => {
      const variant = variantMap.get(item.sku);
      if (!variant) {
        throw new Error(`Missing variant ${item.sku} for order seed`);
      }

      return {
        variantId: variant.id,
        productId: variant.productId,
        quantity: item.quantity,
        price: variant.price,
      };
    });

    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shipping = 10;
    const tax = Number((subtotal * 0.1).toFixed(2));
    const total = Number((subtotal + shipping + tax).toFixed(2));

    await prisma.order.create({
      data: {
        userId: user.id,
        addressId,
        status: orderSeed.status,
        paymentStatus: orderSeed.paymentStatus,
        stripePaymentId: orderSeed.stripePaymentId,
        subtotal,
        shipping,
        tax,
        total,
        notes: orderSeed.notes,
        createdAt: orderSeed.createdAt,
        items: {
          create: lineItems,
        },
      },
    });
  }

  for (const discount of DISCOUNT_SEEDS) {
    await prisma.discount.upsert({
      where: { code: discount.code },
      update: discount,
      create: discount,
    });
  }

  const [productsCount, customersCount, ordersCount, discountsCount] =
    await Promise.all([
      prisma.product.count({
        where: { slug: { in: PRODUCT_SEEDS.map((product) => product.slug) } },
      }),
      prisma.user.count({
        where: {
          email: { in: CUSTOMER_ACCOUNTS.map((customer) => customer.email) },
        },
      }),
      prisma.order.count({
        where: {
          userId: { in: customerIds },
          notes: { startsWith: "[seed]" },
        },
      }),
      prisma.discount.count({
        where: {
          code: { in: DISCOUNT_SEEDS.map((discount) => discount.code) },
        },
      }),
    ]);

  console.log("Seed completed successfully.");
  console.log(`Admin email: ${ADMIN_CREDENTIALS.email}`);
  console.log(`Admin password: ${ADMIN_CREDENTIALS.password}`);
  console.log(`Seeded products: ${productsCount}`);
  console.log(`Seeded customers: ${customersCount}`);
  console.log(`Seeded orders: ${ordersCount}`);
  console.log(`Seeded discounts: ${discountsCount}`);
  console.log(`Admin user id: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
