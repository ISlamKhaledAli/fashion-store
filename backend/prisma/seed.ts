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
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDAGnsbbuvwSlUY_WStz922zawWfeVdjUP72_IMBp2BH0hcqUfFKm6DOtNXmlVjrzbM2yR8U5J6nNN5QSa0wkTb5lvDUakRpIrBY4ecAmffAKnggO_EySHje0YxYb1IcCYOqUtsOW6fLlJKBe5ElgioKVjYdsseGqxX4Te9mKiaWnZo6zfriKOBosLxXKN-VMcrpXUiMTyP23KEGss6NKBhpUuLqejitEv8BQ_Aq27CokLJu_Q7DdVsbZYhzXrcr9YX7Od03JP2Xqs",
  brandStory:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB1_lGLYExz9Ivn1c1cVkz4T8j9N5-zvp5-WMqVCYP50XCmPlxbgrvKF9SPxT5L_o3qVwdFVT6CRTGDUkCW3YHIRns_OgNSvpH2HK9sGxJpOvBTsT2CWSN25soiU6zzHCPYsOg3UO525Y6dL3RRZ0AZc03hZA5yaepmbjGgid9QSRov27ENM_LdD5uLzVH4bxBhpEy944jQfvyYLIldeuKhoGgbW5ptO3H8sl3ClCrJ8xkFVL1KJVqF2y-BQH5hF95YsJWf9r5wyUE",
  outerwear:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCWp6ag_u4U7ifPV37hyc561tjKHwLF87yXobNKu5L6bEeMkNDVlJMG-aDDIpkT_T7FaRDP6PbcL0qPKjbCUL1UpfBAMYGhkaOAvVV9Osuo6ghbQk2ME2YU5IALmmvzEyV93zT-R2o96uBWPwxuiaf4nO46bZdAnc19ugzEKFUWEmkjd2_yOYnbtDZdou8RXGoWwc5kCp4_ZR-PpS6-8vdddMFXGxHxupqD-dqPalnlDJc9pmJLImBM6JYLjC0YRJBCUHf-3Krnhvg",
  essential:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCuGRXRxJYti36qxDXLQRoT0aK_Z0MODRf_M8Puoqr-vFJEcXI20oQ3QbAW94xfeLWKRGzps8wq9YTtz1MKX2jjVnGrlTM5C1sS7JSWUtUJKuawhlKEeR0yiWX5T8XrlJ2L6pL9aD18Iw25XzTiIyAyZ8HAZp5AtMLG-FHnMAz4UpaoU2W_XCvhMAnTHuoxWfsDcy6dRVKuezl5TKqEWbfv9wcK-E24pYCWjaEKre6gSRWi8u8RYZiUmaEL0YkU2BVAB80gcKHO-DI",
  objects:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDmF_-RHH9V_gTgurlKrTmyALRE2G3frBMbIT1E3uv-39xNMGNVzJz3U_cZNRXkrvRp6rdhYQPgLEdLTZcnUphp_4BcbVdbfMXB9DgOfSFdClJc1GdUVilgeePNYEul3smGRHqZxjte8ErHnhd9vMlzzKMD9WrAsgraP0pnxv0CVMyAU4OWUQNkiNydQlRHGwEKCa5ngZeM9Yh_XOd3zDf4zLYFv8qok3_HPY7EJTapp680NpzKgTmxNMPV_alLjeFw8Jb0BgzwHMQ",
  footwear:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCXGSyEG4zwyIT6Us8WqFZzaT3WGB3QMZ8QZfuakhjBeU_CQ9NBVD7g4cd0EDdXbvo12NVee4hYbf2oiB9EoL9Rbdi0EQRVOsnXWGX23NVaB95JwQxmmKY9gNm3X03xWUs7wIWehfeuW7cApgZ6u03XA_opLlFuzHkhLmebOxHA5W6ojeVwgQ8Ygy7eyQF6xw53C-vSMh0pxLZZ1eBA5VkOKlUFray6D7XKp_nhHZkthZUVAqQAWIC6zJK2u5OkmxP7T-35DVjvej8",
} as const;

const CATEGORY_SEEDS = [
  { name: "Outerwear", slug: "outerwear", image: IMAGE_LIBRARY.outerwear },
  { name: "Essential", slug: "essential", image: IMAGE_LIBRARY.essential },
  { name: "Objects", slug: "objects", image: IMAGE_LIBRARY.objects },
  { name: "Footwear", slug: "footwear", image: IMAGE_LIBRARY.footwear },
];

const BRAND_SEEDS = [
  { name: "Atelier North", slug: "atelier-north", logo: IMAGE_LIBRARY.outerwear },
  { name: "Meridian Studio", slug: "meridian-studio", logo: IMAGE_LIBRARY.brandStory },
  { name: "Plain Form", slug: "plain-form", logo: IMAGE_LIBRARY.essential },
  { name: "Urban Drift", slug: "urban-drift", logo: IMAGE_LIBRARY.footwear },
];

const TAG_NAMES = ["Best Seller", "New Season", "Tailored", "Minimal", "Travel Ready", "Limited Run"];

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
    name: "Horizon Trench Coat",
    slug: "horizon-trench-coat",
    description:
      "A water-resistant trench with a clean drape, hidden placket, and a sharp city silhouette built for everyday layering.",
    price: 245,
    comparePrice: 295,
    cost: 135,
    categorySlug: "outerwear",
    brandSlug: "atelier-north",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.outerwear, IMAGE_LIBRARY.hero],
    tagNames: ["Best Seller", "Tailored", "Travel Ready"],
    variants: [
      { size: "S", color: "Sand", colorHex: "#D2BEA1", stock: 7, sku: "SEED-HORIZON-S-SAND" },
      { size: "M", color: "Sand", colorHex: "#D2BEA1", stock: 9, sku: "SEED-HORIZON-M-SAND" },
      { size: "L", color: "Sand", colorHex: "#D2BEA1", stock: 4, sku: "SEED-HORIZON-L-SAND" },
    ],
  },
  {
    name: "Frame Wool Overshirt",
    slug: "frame-wool-overshirt",
    description:
      "A structured overshirt in brushed wool blend with roomy pockets and an easy fit that works as a shirt or light jacket.",
    price: 168,
    comparePrice: 210,
    cost: 92,
    categorySlug: "outerwear",
    brandSlug: "meridian-studio",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.brandStory, IMAGE_LIBRARY.outerwear],
    tagNames: ["Minimal", "New Season"],
    variants: [
      { size: "S", color: "Graphite", colorHex: "#4A4A4F", stock: 6, sku: "SEED-FRAME-S-GRAPHITE" },
      { size: "M", color: "Graphite", colorHex: "#4A4A4F", stock: 8, sku: "SEED-FRAME-M-GRAPHITE" },
      { size: "L", color: "Graphite", colorHex: "#4A4A4F", stock: 5, sku: "SEED-FRAME-L-GRAPHITE" },
    ],
  },
  {
    name: "Core Cotton Tee",
    slug: "core-cotton-tee",
    description:
      "A heavyweight combed-cotton tee with a compact neckline and balanced cut designed to anchor every capsule wardrobe.",
    price: 45,
    comparePrice: 58,
    cost: 18,
    categorySlug: "essential",
    brandSlug: "plain-form",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.essential, IMAGE_LIBRARY.hero],
    tagNames: ["Best Seller", "Minimal"],
    variants: [
      { size: "S", color: "Off White", colorHex: "#F1EDE4", stock: 15, sku: "SEED-CORETEE-S-WHITE" },
      { size: "M", color: "Off White", colorHex: "#F1EDE4", stock: 18, sku: "SEED-CORETEE-M-WHITE" },
      { size: "L", color: "Off White", colorHex: "#F1EDE4", stock: 12, sku: "SEED-CORETEE-L-WHITE" },
    ],
  },
  {
    name: "Line Pleated Trouser",
    slug: "line-pleated-trouser",
    description:
      "A tapered pleated trouser with fluid drape, pressed front crease, and an elastic back waistband for long-day comfort.",
    price: 112,
    comparePrice: 138,
    cost: 54,
    categorySlug: "essential",
    brandSlug: "meridian-studio",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.brandStory, IMAGE_LIBRARY.essential],
    tagNames: ["Tailored", "Travel Ready"],
    variants: [
      { size: "30", color: "Ink", colorHex: "#1D2538", stock: 8, sku: "SEED-LINE-30-INK" },
      { size: "32", color: "Ink", colorHex: "#1D2538", stock: 6, sku: "SEED-LINE-32-INK" },
      { size: "34", color: "Ink", colorHex: "#1D2538", stock: 3, sku: "SEED-LINE-34-INK" },
    ],
  },
  {
    name: "Arc Leather Tote",
    slug: "arc-leather-tote",
    description:
      "A soft-grain leather tote with a generous interior, magnetic closure, and slim straps made for daily carry.",
    price: 138,
    comparePrice: 165,
    cost: 76,
    categorySlug: "objects",
    brandSlug: "atelier-north",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.objects, IMAGE_LIBRARY.brandStory],
    tagNames: ["Limited Run", "Travel Ready"],
    variants: [
      { size: "One Size", color: "Espresso", colorHex: "#4B342D", stock: 7, sku: "SEED-ARC-ONE-ESPRESSO" },
    ],
  },
  {
    name: "Studio Notebook Set",
    slug: "studio-notebook-set",
    description:
      "A set of three cloth-bound notebooks with grid pages and contrast spines for sketches, notes, and travel records.",
    price: 28,
    comparePrice: 36,
    cost: 10,
    categorySlug: "objects",
    brandSlug: "plain-form",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.objects, IMAGE_LIBRARY.essential],
    tagNames: ["Minimal", "New Season"],
    variants: [
      { size: "Set of 3", color: "Stone", colorHex: "#C8C0B4", stock: 20, sku: "SEED-NOTEBOOK-SET3-STONE" },
    ],
  },
  {
    name: "Stride Court Sneaker",
    slug: "stride-court-sneaker",
    description:
      "A low-profile leather sneaker with tonal stitching, cushioned insole, and rubber sole made for repeat wear.",
    price: 142,
    comparePrice: 175,
    cost: 74,
    categorySlug: "footwear",
    brandSlug: "urban-drift",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.footwear, IMAGE_LIBRARY.hero],
    tagNames: ["Best Seller", "Travel Ready"],
    variants: [
      { size: "41", color: "Chalk", colorHex: "#E8E2D8", stock: 8, sku: "SEED-STRIDE-41-CHALK" },
      { size: "42", color: "Chalk", colorHex: "#E8E2D8", stock: 5, sku: "SEED-STRIDE-42-CHALK" },
      { size: "43", color: "Chalk", colorHex: "#E8E2D8", stock: 4, sku: "SEED-STRIDE-43-CHALK" },
    ],
  },
  {
    name: "Mono Suede Mule",
    slug: "mono-suede-mule",
    description:
      "A soft suede mule with a molded footbed and pared-back profile that slips seamlessly into warm-weather rotation.",
    price: 118,
    comparePrice: 149,
    cost: 58,
    categorySlug: "footwear",
    brandSlug: "urban-drift",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.footwear, IMAGE_LIBRARY.brandStory],
    tagNames: ["Limited Run", "Minimal"],
    variants: [
      { size: "39", color: "Taupe", colorHex: "#8E7B67", stock: 3, sku: "SEED-MONO-39-TAUPE" },
      { size: "40", color: "Taupe", colorHex: "#8E7B67", stock: 2, sku: "SEED-MONO-40-TAUPE" },
      { size: "41", color: "Taupe", colorHex: "#8E7B67", stock: 4, sku: "SEED-MONO-41-TAUPE" },
    ],
  },
  {
    name: "Atlas Rain Shell",
    slug: "atlas-rain-shell",
    description:
      "A lightweight utility shell with sealed seams, clean hardware, and an easy hooded profile for changing weather.",
    price: 198,
    comparePrice: 238,
    cost: 105,
    categorySlug: "outerwear",
    brandSlug: "atelier-north",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.outerwear, IMAGE_LIBRARY.hero],
    tagNames: ["Travel Ready", "New Season"],
    variants: [
      { size: "S", color: "Olive", colorHex: "#6D7752", stock: 8, sku: "SEED-ATLAS-S-OLIVE" },
      { size: "M", color: "Olive", colorHex: "#6D7752", stock: 11, sku: "SEED-ATLAS-M-OLIVE" },
      { size: "L", color: "Olive", colorHex: "#6D7752", stock: 6, sku: "SEED-ATLAS-L-OLIVE" },
    ],
  },
  {
    name: "Dune Field Parka",
    slug: "dune-field-parka",
    description:
      "A mid-length parka with roomy pockets, adjustable hem, and soft technical texture made for layered daily wear.",
    price: 214,
    comparePrice: 258,
    cost: 116,
    categorySlug: "outerwear",
    brandSlug: "meridian-studio",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.outerwear, IMAGE_LIBRARY.brandStory],
    tagNames: ["Tailored", "Travel Ready"],
    variants: [
      { size: "M", color: "Clay", colorHex: "#A5866D", stock: 7, sku: "SEED-DUNE-M-CLAY" },
      { size: "L", color: "Clay", colorHex: "#A5866D", stock: 5, sku: "SEED-DUNE-L-CLAY" },
      { size: "XL", color: "Clay", colorHex: "#A5866D", stock: 4, sku: "SEED-DUNE-XL-CLAY" },
    ],
  },
  {
    name: "Quarry Bomber Jacket",
    slug: "quarry-bomber-jacket",
    description:
      "A cropped bomber jacket with matte finish, ribbed trim, and a compact silhouette built around modern utility.",
    price: 176,
    comparePrice: 212,
    cost: 89,
    categorySlug: "outerwear",
    brandSlug: "urban-drift",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.brandStory, IMAGE_LIBRARY.outerwear],
    tagNames: ["Best Seller", "Minimal"],
    variants: [
      { size: "S", color: "Onyx", colorHex: "#232327", stock: 6, sku: "SEED-QUARRY-S-ONYX" },
      { size: "M", color: "Onyx", colorHex: "#232327", stock: 8, sku: "SEED-QUARRY-M-ONYX" },
      { size: "L", color: "Onyx", colorHex: "#232327", stock: 5, sku: "SEED-QUARRY-L-ONYX" },
    ],
  },
  {
    name: "Mercer Linen Shirt",
    slug: "mercer-linen-shirt",
    description:
      "A breathable linen shirt with soft collar roll and relaxed proportions designed for warm days and easy layering.",
    price: 84,
    comparePrice: 102,
    cost: 34,
    categorySlug: "essential",
    brandSlug: "meridian-studio",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.essential, IMAGE_LIBRARY.brandStory],
    tagNames: ["New Season", "Minimal"],
    variants: [
      { size: "S", color: "Sky", colorHex: "#AFC7D7", stock: 12, sku: "SEED-MERCER-S-SKY" },
      { size: "M", color: "Sky", colorHex: "#AFC7D7", stock: 10, sku: "SEED-MERCER-M-SKY" },
      { size: "L", color: "Sky", colorHex: "#AFC7D7", stock: 8, sku: "SEED-MERCER-L-SKY" },
    ],
  },
  {
    name: "Rib Tank Layer",
    slug: "rib-tank-layer",
    description:
      "A fine-rib cotton tank with a close fit and clean finish that works under shirting or on its own in heat.",
    price: 34,
    comparePrice: 42,
    cost: 13,
    categorySlug: "essential",
    brandSlug: "plain-form",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.essential, IMAGE_LIBRARY.hero],
    tagNames: ["Minimal", "Best Seller"],
    variants: [
      { size: "S", color: "Bone", colorHex: "#E8E0D3", stock: 18, sku: "SEED-RIBTANK-S-BONE" },
      { size: "M", color: "Bone", colorHex: "#E8E0D3", stock: 16, sku: "SEED-RIBTANK-M-BONE" },
      { size: "L", color: "Bone", colorHex: "#E8E0D3", stock: 12, sku: "SEED-RIBTANK-L-BONE" },
    ],
  },
  {
    name: "Column Knit Polo",
    slug: "column-knit-polo",
    description:
      "A lightweight knit polo with a structured collar and smooth hand feel for a sharper take on summer basics.",
    price: 92,
    comparePrice: 118,
    cost: 41,
    categorySlug: "essential",
    brandSlug: "plain-form",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.brandStory, IMAGE_LIBRARY.essential],
    tagNames: ["Tailored", "New Season"],
    variants: [
      { size: "S", color: "Navy", colorHex: "#2C3552", stock: 9, sku: "SEED-COLUMN-S-NAVY" },
      { size: "M", color: "Navy", colorHex: "#2C3552", stock: 10, sku: "SEED-COLUMN-M-NAVY" },
      { size: "L", color: "Navy", colorHex: "#2C3552", stock: 7, sku: "SEED-COLUMN-L-NAVY" },
    ],
  },
  {
    name: "Transit Hoodie",
    slug: "transit-hoodie",
    description:
      "A dense brushed-cotton hoodie with clean kangaroo pocket construction and a relaxed street-ready silhouette.",
    price: 96,
    comparePrice: 124,
    cost: 44,
    categorySlug: "essential",
    brandSlug: "urban-drift",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.hero, IMAGE_LIBRARY.essential],
    tagNames: ["Travel Ready", "Best Seller"],
    variants: [
      { size: "M", color: "Smoke", colorHex: "#7B7C84", stock: 14, sku: "SEED-TRANSIT-M-SMOKE" },
      { size: "L", color: "Smoke", colorHex: "#7B7C84", stock: 11, sku: "SEED-TRANSIT-L-SMOKE" },
      { size: "XL", color: "Smoke", colorHex: "#7B7C84", stock: 7, sku: "SEED-TRANSIT-XL-SMOKE" },
    ],
  },
  {
    name: "Everyday Drawstring Pant",
    slug: "everyday-drawstring-pant",
    description:
      "An easy tapered pant with soft drape, drawstring waist, and all-day comfort for city wear or travel.",
    price: 88,
    comparePrice: 110,
    cost: 39,
    categorySlug: "essential",
    brandSlug: "plain-form",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.essential, IMAGE_LIBRARY.brandStory],
    tagNames: ["Travel Ready", "Minimal"],
    variants: [
      { size: "30", color: "Slate", colorHex: "#5C6675", stock: 9, sku: "SEED-EVERYDAY-30-SLATE" },
      { size: "32", color: "Slate", colorHex: "#5C6675", stock: 8, sku: "SEED-EVERYDAY-32-SLATE" },
      { size: "34", color: "Slate", colorHex: "#5C6675", stock: 6, sku: "SEED-EVERYDAY-34-SLATE" },
    ],
  },
  {
    name: "Fold Travel Pouch",
    slug: "fold-travel-pouch",
    description:
      "A zip travel pouch in structured canvas with interior slip sections sized for cords, tools, and daily carry.",
    price: 42,
    comparePrice: 54,
    cost: 17,
    categorySlug: "objects",
    brandSlug: "atelier-north",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.objects, IMAGE_LIBRARY.outerwear],
    tagNames: ["Travel Ready", "Limited Run"],
    variants: [
      { size: "One Size", color: "Tan", colorHex: "#B7946C", stock: 15, sku: "SEED-FOLD-ONE-TAN" },
    ],
  },
  {
    name: "Archive Canvas Cap",
    slug: "archive-canvas-cap",
    description:
      "A six-panel washed canvas cap with tonal embroidery and an adjustable back tab for everyday wear.",
    price: 29,
    comparePrice: 36,
    cost: 11,
    categorySlug: "objects",
    brandSlug: "urban-drift",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.objects, IMAGE_LIBRARY.hero],
    tagNames: ["Best Seller", "New Season"],
    variants: [
      { size: "One Size", color: "Forest", colorHex: "#495B43", stock: 18, sku: "SEED-CAP-ONE-FOREST" },
    ],
  },
  {
    name: "Resin Desk Tray",
    slug: "resin-desk-tray",
    description:
      "A cast resin valet tray with rounded corners and subtle marbling for keys, rings, and pocket essentials.",
    price: 36,
    comparePrice: 44,
    cost: 14,
    categorySlug: "objects",
    brandSlug: "plain-form",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.objects, IMAGE_LIBRARY.brandStory],
    tagNames: ["Minimal", "Limited Run"],
    variants: [
      { size: "One Size", color: "Amber", colorHex: "#A96D3B", stock: 12, sku: "SEED-TRAY-ONE-AMBER" },
    ],
  },
  {
    name: "Harbour Slip Sneaker",
    slug: "harbour-slip-sneaker",
    description:
      "A pared-back slip-on sneaker with elastic gussets, cushioned insole, and smooth leather upper for easy rotation.",
    price: 126,
    comparePrice: 154,
    cost: 61,
    categorySlug: "footwear",
    brandSlug: "urban-drift",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.footwear, IMAGE_LIBRARY.essential],
    tagNames: ["Travel Ready", "Minimal"],
    variants: [
      { size: "41", color: "Cream", colorHex: "#E7DFC9", stock: 7, sku: "SEED-HARBOUR-41-CREAM" },
      { size: "42", color: "Cream", colorHex: "#E7DFC9", stock: 9, sku: "SEED-HARBOUR-42-CREAM" },
      { size: "43", color: "Cream", colorHex: "#E7DFC9", stock: 6, sku: "SEED-HARBOUR-43-CREAM" },
    ],
  },
  {
    name: "Vector Runner",
    slug: "vector-runner",
    description:
      "A mixed-material runner with sculpted sole, breathable mesh, and light technical comfort for daily movement.",
    price: 154,
    comparePrice: 188,
    cost: 77,
    categorySlug: "footwear",
    brandSlug: "urban-drift",
    featured: true,
    imageUrls: [IMAGE_LIBRARY.footwear, IMAGE_LIBRARY.hero],
    tagNames: ["Best Seller", "New Season"],
    variants: [
      { size: "41", color: "Shadow", colorHex: "#676C7A", stock: 10, sku: "SEED-VECTOR-41-SHADOW" },
      { size: "42", color: "Shadow", colorHex: "#676C7A", stock: 8, sku: "SEED-VECTOR-42-SHADOW" },
      { size: "43", color: "Shadow", colorHex: "#676C7A", stock: 7, sku: "SEED-VECTOR-43-SHADOW" },
    ],
  },
  {
    name: "Studio Leather Derby",
    slug: "studio-leather-derby",
    description:
      "A polished derby in smooth leather with stacked sole, soft lining, and formal proportions tuned for modern wardrobes.",
    price: 188,
    comparePrice: 226,
    cost: 98,
    categorySlug: "footwear",
    brandSlug: "atelier-north",
    featured: false,
    imageUrls: [IMAGE_LIBRARY.footwear, IMAGE_LIBRARY.brandStory],
    tagNames: ["Tailored", "Limited Run"],
    variants: [
      { size: "41", color: "Chestnut", colorHex: "#7A4A2D", stock: 5, sku: "SEED-DERBY-41-CHESTNUT" },
      { size: "42", color: "Chestnut", colorHex: "#7A4A2D", stock: 6, sku: "SEED-DERBY-42-CHESTNUT" },
      { size: "43", color: "Chestnut", colorHex: "#7A4A2D", stock: 4, sku: "SEED-DERBY-43-CHESTNUT" },
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
    productSlug: "horizon-trench-coat",
    rating: 5,
    title: "Exactly the shape I wanted",
    body: "The drape is clean, the fabric feels premium, and it works over both tailoring and denim.",
  },
  {
    email: "omar@fashion-store.dev",
    productSlug: "core-cotton-tee",
    rating: 4,
    title: "Strong everyday basic",
    body: "Heavy enough to feel substantial without being stiff. I came back for a second color in my real closet.",
  },
  {
    email: "layla@fashion-store.dev",
    productSlug: "arc-leather-tote",
    rating: 5,
    title: "Quiet luxury feel",
    body: "Fits my laptop, sketchbook, and charger with room left. The proportions look polished on shoulder.",
  },
  {
    email: "sarah@fashion-store.dev",
    productSlug: "stride-court-sneaker",
    rating: 4,
    title: "Comfortable out of the box",
    body: "No break-in drama and the sole has enough support for long days moving around the city.",
  },
];

const WISHLIST_SEEDS = [
  { email: "sarah@fashion-store.dev", productSlug: "mono-suede-mule" },
  { email: "omar@fashion-store.dev", productSlug: "frame-wool-overshirt" },
  { email: "layla@fashion-store.dev", productSlug: "line-pleated-trouser" },
];

const ORDER_SEEDS = [
  {
    email: "sarah@fashion-store.dev",
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    stripePaymentId: "pi_seed_sarah_paid",
    notes: "[seed] Delivered capsule wardrobe order",
    createdAt: daysAgo(10),
    items: [
      { sku: "SEED-HORIZON-M-SAND", quantity: 1 },
      { sku: "SEED-CORETEE-M-WHITE", quantity: 2 },
    ],
  },
  {
    email: "omar@fashion-store.dev",
    status: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.PAID,
    stripePaymentId: "pi_seed_omar_today",
    notes: "[seed] Same-day paid footwear order",
    createdAt: hoursAgo(5),
    items: [{ sku: "SEED-STRIDE-42-CHALK", quantity: 1 }],
  },
  {
    email: "layla@fashion-store.dev",
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    stripePaymentId: null,
    notes: "[seed] Pending accessories order",
    createdAt: daysAgo(2),
    items: [
      { sku: "SEED-ARC-ONE-ESPRESSO", quantity: 1 },
      { sku: "SEED-NOTEBOOK-SET3-STONE", quantity: 2 },
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
  const variantMap = new Map<string, { id: string; productId: string; price: number }>();

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

    productMap.set(product.slug, { id: productRecord.id, price: product.price });
  }

  const customerIds = Array.from(customers.values()).map((user) => user.id);
  const productIds = Array.from(productMap.values()).map((product) => product.id);

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
        throw new Error(`Missing review dependency for ${review.email} / ${review.productSlug}`);
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
        throw new Error(`Missing wishlist dependency for ${entry.email} / ${entry.productSlug}`);
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
          { variantId: variantMap.get("SEED-LINE-32-INK")?.id as string, quantity: 1 },
          { variantId: variantMap.get("SEED-MONO-40-TAUPE")?.id as string, quantity: 1 },
        ],
      },
    },
    create: {
      userId: layla.id,
      items: {
        create: [
          { variantId: variantMap.get("SEED-LINE-32-INK")?.id as string, quantity: 1 },
          { variantId: variantMap.get("SEED-MONO-40-TAUPE")?.id as string, quantity: 1 },
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

    const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

  const [productsCount, customersCount, ordersCount, discountsCount] = await Promise.all([
    prisma.product.count({ where: { slug: { in: PRODUCT_SEEDS.map((product) => product.slug) } } }),
    prisma.user.count({ where: { email: { in: CUSTOMER_ACCOUNTS.map((customer) => customer.email) } } }),
    prisma.order.count({
      where: {
        userId: { in: customerIds },
        notes: { startsWith: "[seed]" },
      },
    }),
    prisma.discount.count({ where: { code: { in: DISCOUNT_SEEDS.map((discount) => discount.code) } } }),
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
