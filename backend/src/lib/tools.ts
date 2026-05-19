import { prisma } from "./prisma";

export const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search the product catalog for active fashion products matching the search query, category, price, and color filters.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "General search term for product name or description (e.g. 'jacket', 't-shirt')."
          },
          category: {
            type: "string",
            description: "Optional category name or slug to filter products."
          },
          maxPrice: {
            type: "number",
            description: "Optional maximum price filter."
          },
          color: {
            type: "string",
            description: "Optional color to filter products."
          },
          limit: {
            type: "number",
            description: "Maximum number of items to return. Max 10. Default is 5.",
            default: 5
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description: "Get detailed specifications, size selection options, and stock details for a specific active product using its unique ID.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "The unique ID of the product."
          }
        },
        required: ["productId"]
      }
    }
  }
];

export const executeSearchProducts = async (args: {
  query: string;
  category?: string;
  maxPrice?: number;
  color?: string;
  limit?: number;
}) => {
  const limit = Math.min(args.limit || 5, 10);
  const whereClause: any = {
    status: "ACTIVE",
  };

  if (args.query) {
    whereClause.OR = [
      { name: { contains: args.query, mode: "insensitive" } },
      { description: { contains: args.query, mode: "insensitive" } },
    ];
  }

  if (args.category) {
    whereClause.category = {
      OR: [
        { name: { contains: args.category, mode: "insensitive" } },
        { slug: { contains: args.category, mode: "insensitive" } },
      ],
    };
  }

  if (args.maxPrice) {
    whereClause.price = { lte: Number(args.maxPrice) };
  }

  if (args.color) {
    whereClause.variants = {
      some: {
        color: { contains: args.color, mode: "insensitive" },
      },
    };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    take: limit,
    include: {
      category: true,
      brand: true,
      variants: true,
    },
  });

  return products.map((p) => {
    const sizes = Array.from(new Set(p.variants.map((v) => v.size)));
    const colors = Array.from(new Set(p.variants.map((v) => v.color)));
    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category.name,
      brand: p.brand?.name || "The Curator",
      price: p.price,
      comparePrice: p.comparePrice,
      description: p.description,
      sizes,
      colors,
      stock: totalStock,
    };
  });
};

export const executeGetProductDetails = async (args: { productId: string }) => {
  const p = await prisma.product.findFirst({
    where: {
      id: args.productId,
      status: "ACTIVE",
    },
    include: {
      category: true,
      brand: true,
      variants: true,
    },
  });

  if (!p) return { error: "Product not found or inactive" };

  const sizes = Array.from(new Set(p.variants.map((v) => v.size)));
  const colors = Array.from(new Set(p.variants.map((v) => v.color)));
  const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category.name,
    brand: p.brand?.name || "The Curator",
    price: p.price,
    comparePrice: p.comparePrice,
    description: p.description,
    sizes,
    colors,
    stock: totalStock,
    variants: p.variants.map((v) => ({
      size: v.size,
      color: v.color,
      stock: v.stock,
    })),
  };
};

export const executeTool = async (name: string, args: any) => {
  switch (name) {
    case "search_products":
      return await executeSearchProducts(args);
    case "get_product_details":
      return await executeGetProductDetails(args);
    default:
      throw new Error(`Tool ${name} not found`);
  }
};
