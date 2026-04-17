import { Prisma } from "@prisma/client";

interface QueryParams {
  category?: any;
  brand?: any;
  search?: any;
  sort?: any;
  status?: any;
  featured?: any;
  minPrice?: any;
  maxPrice?: any;
  color?: any;
  adminMode?: boolean;
}

export const buildProductQuery = ({
  category,
  brand,
  search,
  sort,
  status,
  featured,
  minPrice,
  maxPrice,
  color,
  adminMode = false,
}: QueryParams) => {
  const where: any = {};

  // 1. Status Filter
  if (adminMode) {
    if (status && status !== "ALL" && status !== "all") {
      where.status = String(status).toUpperCase();
    }
  } else {
    if (status && status !== "all") {
      where.status = status;
    } else {
      where.status = "ACTIVE";
    }
  }

  // 2. Category Filter
  if (category) {
    if (adminMode) {
      where.category = {
        name: { equals: String(category), mode: "insensitive" },
      };
    } else {
      const cats = String(category).split(",").map((c) => c.trim());
      where.category = {
        OR: cats.map((cat) => ({
          name: { equals: cat, mode: "insensitive" },
        })),
      };
    }
  }

  // 3. Brand Filter
  if (brand) {
    where.brand = {
      OR: [
        { slug: { equals: String(brand), mode: "insensitive" } },
        { name: { equals: String(brand), mode: "insensitive" } },
      ],
    };
  }

  // 4. Featured Filter
  if (featured !== undefined && !adminMode) {
    where.featured = String(featured) === "true";
  }

  // 5. Price Filter
  if ((minPrice || maxPrice) && !adminMode) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  // 6. Search Filter
  if (search) {
    if (adminMode) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
        { variants: { some: { sku: { contains: String(search), mode: "insensitive" } } } },
      ];
    } else {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
        { category: { name: { contains: String(search), mode: "insensitive" } } },
        { brand: { name: { contains: String(search), mode: "insensitive" } } },
        { tags: { some: { tag: { name: { contains: String(search), mode: "insensitive" } } } } },
      ];
    }
  }

  // 7. Color Filter
  if (color && !adminMode) {
    const colors = String(color).split(",").map((c) => c.trim());
    where.variants = {
      some: {
        color: {
          in: colors,
          mode: "insensitive",
        },
      },
    };
  }

  // 8. OrderBy
  const orderBy: any = {};
  if (sort) {
    const [field, order] = String(sort).split(":");
    orderBy[field] = order || "asc";
  } else {
    orderBy.createdAt = "desc";
  }

  // 9. Include / Select
  const include: any = {
    category: { select: { name: true, slug: true } },
    brand: { select: { name: true, slug: true } },
    _count: { select: { reviews: true } },
  };

  if (adminMode) {
    include.images = true;
    include.variants = true;
  } else {
    include.images = { where: { isMain: true }, take: 1 };
    include.variants = {
      select: { id: true, size: true, color: true, colorHex: true, stock: true },
      take: 1,
    };
    include.reviews = { select: { rating: true } };
  }

  return { where, orderBy, include };
};
