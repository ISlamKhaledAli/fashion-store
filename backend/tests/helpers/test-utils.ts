import { Role } from "@prisma/client";
import { prisma } from "../../src/lib/prisma";
import { hashPassword } from "../../src/utils/bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../src/utils/jwt";

let uniqueSequence = 0;

const nextValue = (prefix: string) => `${prefix}-${Date.now()}-${uniqueSequence++}`;

export const bearerToken = (token: string) => `Bearer ${token}`;

export const createUser = async ({
  role = "CUSTOMER",
  password = "Password123!",
  email = `${nextValue("user")}@example.com`,
  name = "Test User",
  phone,
}: {
  role?: Role;
  password?: string;
  email?: string;
  name?: string;
  phone?: string;
} = {}) => {
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      phone,
      role,
      password: hashedPassword,
    },
  });

  return {
    user,
    password,
    accessToken: generateAccessToken(user.id, user.role),
    refreshToken: generateRefreshToken(user.id),
  };
};

export const createAdminUser = async (overrides: Parameters<typeof createUser>[0] = {}) =>
  createUser({ ...overrides, role: "ADMIN" });

export const createCategory = async ({
  name = "Tops",
  slug = nextValue("tops"),
  image,
  parentId,
}: {
  name?: string;
  slug?: string;
  image?: string;
  parentId?: string;
} = {}) => {
  return prisma.category.create({
    data: {
      name,
      slug,
      image,
      parentId,
    },
  });
};

export const createProductFixture = async ({
  name = "Classic Tee",
  price = 50,
  categoryId,
  status = "ACTIVE",
  stock = 10,
}: {
  name?: string;
  price?: number;
  categoryId?: string;
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  stock?: number;
} = {}) => {
  const category = categoryId ? null : await createCategory();
  const baseSlug = nextValue("classic-tee");

  const product = await prisma.product.create({
    data: {
      name,
      slug: baseSlug,
      description: "A test-friendly product fixture",
      price,
      categoryId: categoryId ?? category?.id ?? "",
      status,
      featured: true,
      variants: {
        create: {
          size: "M",
          color: "Black",
          colorHex: "#000000",
          stock,
          sku: nextValue("sku"),
        },
      },
    },
    include: {
      variants: true,
      category: true,
    },
  });

  return {
    product,
    variant: product.variants[0],
  };
};

export const createAddress = async (userId: string) => {
  return prisma.address.create({
    data: {
      userId,
      label: "Home",
      firstName: "Jane",
      lastName: "Customer",
      street: "123 Test Street",
      apartment: "Unit 4B",
      city: "Cairo",
      state: "Cairo",
      zip: "11511",
      country: "EG",
      isDefault: true,
    },
  });
};
