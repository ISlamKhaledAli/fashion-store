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
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "product_tags",
      "order_items",
      "orders",
      "cart_items",
      "carts",
      "reviews",
      "wishlists",
      "product_images",
      "variants",
      "products",
      "brands",
      "categories",
      "addresses",
      "discounts",
      "tags",
      "users"
    RESTART IDENTITY CASCADE;
  `);
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
