console.log("[SETUP TESTS] Executing setup-tests.ts script!");
import { disconnectPrisma, prisma } from "../src/lib/prisma";

jest.mock("../src/services/stripe", () => ({
  __esModule: true,
  createPaymentIntent: jest.fn(async (amount: number, currency = "usd", metadata: Record<string, string> = {}) => ({
    id: "pi_mock_test",
    amount,
    currency,
    metadata,
    client_secret: "pi_mock_test_secret",
  })),
  verifyStripeWebhook: jest.fn((payload: unknown) => payload),
  default: {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(async (id: string) => ({
        id: id,
        amount: 12000, // $120.00 in cents
        status: "succeeded",
        metadata: { userId: "mock-user-id" },
      })),
      update: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

jest.mock("../src/services/cloudinary", () => ({
  __esModule: true,
  uploadToCloudinary: jest.fn(async () => ({
    secure_url: "https://example.com/test-image.jpg",
    public_id: "test-image-public-id",
  })),
  deleteFromCloudinary: jest.fn(async () => ({
    result: "ok",
  })),
}));

jest.mock("../src/services/email", () => ({
  __esModule: true,
  sendEmail: jest.fn(async () => undefined),
}));

const resetDatabase = async () => {
  console.log("[RESET DB] Starting truncate...");
  try {
    const searchPathRes = await prisma.$queryRawUnsafe('SHOW search_path');
    const currentSchemaRes = await prisma.$queryRawUnsafe('SELECT current_schema()');
    console.log("[RESET DB] SHOW search_path =", JSON.stringify(searchPathRes));
    console.log("[RESET DB] SELECT current_schema() =", JSON.stringify(currentSchemaRes));

    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "fashion_store_test"."product_tags",
        "fashion_store_test"."order_items",
        "fashion_store_test"."orders",
        "fashion_store_test"."cart_items",
        "fashion_store_test"."carts",
        "fashion_store_test"."reviews",
        "fashion_store_test"."wishlists",
        "fashion_store_test"."product_images",
        "fashion_store_test"."variants",
        "fashion_store_test"."products",
        "fashion_store_test"."brands",
        "fashion_store_test"."categories",
        "fashion_store_test"."addresses",
        "fashion_store_test"."discounts",
        "fashion_store_test"."tags",
        "fashion_store_test"."users"
      RESTART IDENTITY CASCADE;
    `);
    console.log("[RESET DB] Truncate successful!");
  } catch (err) {
    console.error("[RESET DB] Truncate failed!", err);
    throw err;
  }
};

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  jest.clearAllMocks();
  await resetDatabase();
});

afterAll(async () => {
  await resetDatabase();
  await disconnectPrisma();
});
