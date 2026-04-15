import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { getPagination, calculatePagination } from "../utils/pagination";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";
import { NotFoundError } from "../utils/AppError";
import { Prisma } from "@prisma/client";

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("[DEBUG] Incoming Products Query:", req.query);
    const { 
      category, brand, minPrice, maxPrice, search, sort, page, limit, featured, color,
      status 
    } = req.query;

    const { skip, limit: take, page: currentPage } = getPagination({
      page: Number(page),
      limit: Number(limit),
    });

    const where: any = {};
    
    // Status filtering logic
    if (status) {
      if (status !== 'all') {
        where.status = status;
      }
      // if 'all', we don't apply any status filter
    } else {
      // Default to ACTIVE for storefront safety
      where.status = "ACTIVE";
    }

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

export const getProductByIdentifier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier: slug } = req.params;

    // Try finding by slug first, then by ID to support stable routing
    let product = await prisma.product.findUnique({
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
      product = await prisma.product.findUnique({
        where: { id: String(slug) },
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
    }

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

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: String(id) },
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

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const { variants, images, ...productData } = validatedData;

    const product = await prisma.product.create({
      data: {
        ...productData as any,
        slug: productData.name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
        variants: {
          create: variants,
        },
        images: images ? {
          create: images,
        } : undefined,
      },
      include: {
        variants: true,
        images: true,
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

    const parseResult = updateProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.error("[VALIDATION ERROR]", parseResult.error.flatten());
      return res.status(400).json({ 
        success: false, 
        message: "Validation failed", 
        errors: parseResult.error.flatten() 
      });
    }
    const validatedData = parseResult.data;

    const { variants, images, ...productData } = validatedData;
    
    // Prepare product update data
    const updateData: any = { ...productData };
    // DO NOT regenerate slug automatically on update to maintain URL stability
    // Slug is generated only during creation in createProduct()

    // First check if product exists
    const existing = await prisma.product.findUnique({ 
      where: { id: String(id) },
      include: { variants: true, images: true },
    });
    if (!existing) throw new NotFoundError("Product not found");

    // Use a transaction to ensure atomicity
    const product = await prisma.$transaction(async (tx) => {
      // 1. Handle variants separately if provided
      if (variants) {
        const existingVariantIds = existing.variants.map(v => v.id);
        const incomingVariantIds = variants.filter(v => v.id).map(v => v.id!);

        // Delete removed variants
        const variantIdsToDelete = existingVariantIds.filter(
          eid => !incomingVariantIds.includes(eid)
        );
        if (variantIdsToDelete.length > 0) {
          await tx.cartItem.deleteMany({
            where: { variantId: { in: variantIdsToDelete } },
          });
          await tx.variant.deleteMany({
            where: { id: { in: variantIdsToDelete } },
          });
        }

        // Update existing variants (two-pass for SKU swaps)
        for (const v of variants) {
          if (v.id && existingVariantIds.includes(v.id)) {
            await tx.variant.update({
              where: { id: v.id },
              data: { sku: `_tmp_${v.id}_${Date.now()}` },
            });
          }
        }

        for (const v of variants) {
          if (v.id && existingVariantIds.includes(v.id)) {
            const { id: variantId, ...data } = v;
            await tx.variant.update({
              where: { id: variantId },
              data: data as any,
            });
          }
        }

        // Create new variants
        const newVariants = variants
          .filter(v => !v.id)
          .map(({ id: _id, ...rest }) => ({
            ...rest,
            productId: String(id),
          }));
        if (newVariants.length > 0) {
          await tx.variant.createMany({ data: newVariants as any });
        }
      }

      // 2. Handle images separately if provided
      if (images) {
        const existingImageIds = existing.images.map(img => img.id);
        const incomingImageIds = images.filter(img => img.id).map(img => img.id!);

        // Delete removed images
        const imageIdsToDelete = existingImageIds.filter(
          eid => !incomingImageIds.includes(eid)
        );
        if (imageIdsToDelete.length > 0) {
          await tx.productImage.deleteMany({
            where: { id: { in: imageIdsToDelete } },
          });
        }

        // Update existing images (e.g., changing isMain status)
        for (const img of images) {
          if (img.id && existingImageIds.includes(img.id)) {
            const { id: imageId, ...data } = img;
            await tx.productImage.update({
              where: { id: imageId },
              data: data as any,
            });
          }
        }

        // Create new images
        const newImages = images
          .filter(img => !img.id)
          .map(({ id: _id, ...rest }) => ({
            ...rest,
            productId: String(id),
          }));
        if (newImages.length > 0) {
          await tx.productImage.createMany({ data: newImages as any });
        }
      }

      // Update the product
      return tx.product.update({
        where: { id: String(id) },
        data: updateData,
        include: { variants: true, images: true, category: true, brand: true },
      });
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("[UPDATE PRODUCT ERROR]", error);
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

