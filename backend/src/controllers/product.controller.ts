import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { getPagination, calculatePagination } from "../utils/pagination";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";
import { NotFoundError } from "../utils/AppError";

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("[DEBUG] Incoming Products Query:", req.query);
    const { category, brand, minPrice, maxPrice, search, sort, page, limit, featured, color } = req.query;

    const { skip, limit: take, page: currentPage } = getPagination({
      page: Number(page),
      limit: Number(limit),
    });

    const where: any = {
      status: "ACTIVE",
    };

    if (category) {
      const cats = String(category).split(",").map(c => c.trim());
      // use OR with mode: insensitive to support multiple categories correctly
      where.category = {
        OR: cats.map(cat => ({
          name: {
            equals: cat,
            mode: "insensitive"
          }
        }))
      };
    }

    if (brand) {
      where.brand = {
        OR: [
          { slug: { equals: String(brand), mode: "insensitive" } },
          { name: { equals: String(brand), mode: "insensitive" } }
        ]
      };
    }

    if (featured !== undefined) {
      where.featured = String(featured) === "true";
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
      ];
    }
    
    if (color) {
      const colors = String(color).split(",").map(c => c.trim());
      where.variants = {
        some: { 
          color: { 
            in: colors,
            mode: "insensitive"
          } 
        }
      };
    }

    console.log("[DEBUG] Prisma Where Clause:", JSON.stringify(where, null, 2));

    const orderBy: any = {};
    if (sort) {
      const [field, order] = String(sort).split(":");
      orderBy[field] = order || "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          images: { where: { isMain: true }, take: 1 },
          variants: { 
            select: { id: true, size: true, color: true, colorHex: true, stock: true },
            take: 1
          },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    console.log(`[DEBUG] Found ${products.length} products (Total: ${total})`);

    const pagination = calculatePagination(total, currentPage, take);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: products,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug: String(slug) },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    }) as any;

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / product.reviews.length
      : 0;

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: { ...product, avgRating },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const { variants, ...productData } = validatedData;

    const product = await prisma.product.create({
      data: {
        ...productData as any,
        slug: productData.name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
        variants: {
          create: variants,
        },
      },
      include: {
        variants: true,
      },
    });

    return sendResponse({
      res,
      status: 201,
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body);
    const { variants, ...productData } = validatedData;

    // First check if product exists
    const existing = await prisma.product.findUnique({ where: { id: String(id) } });
    if (!existing) throw new NotFoundError("Product not found");

    // Handle variants separately if provided
    if (variants) {
      await prisma.variant.deleteMany({ where: { productId: String(id) } });
      await prisma.variant.createMany({
        data: variants.map(v => ({ ...v, productId: String(id) })) as any,
      });
    }

    const product = await prisma.product.update({
      where: { id: String(id) },
      data: productData as any,
      include: { variants: true },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check existence
    const existing = await prisma.product.findUnique({ where: { id: String(id) } });
    if (!existing) throw new NotFoundError("Product not found");

    await prisma.product.update({
      where: { id: String(id) },
      data: { status: "ARCHIVED" },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Product archived successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getProductFilters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variants = await prisma.variant.findMany({
      distinct: ["color"],
      select: {
        color: true,
        colorHex: true,
      },
    });

    const colors = variants.map(v => ({
      name: v.color,
      hex: v.colorHex || "#000000"
    }));

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: { colors },
    });
  } catch (error) {
    next(error);
  }
};

