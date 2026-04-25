import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import { getPagination, calculatePagination } from "../utils/pagination";
import { buildProductQuery } from "../utils/productQueryBuilder";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";
import { NotFoundError, ConflictError } from "../utils/AppError";
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

    const { where, orderBy, include } = buildProductQuery({
      category, brand, featured, minPrice, maxPrice, search, sort, color, status,
      adminMode: false
    });

    console.log("[DEBUG] Prisma Where Clause:", JSON.stringify(where, null, 2));

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take,
        skip,
        orderBy,
        include,
      }),
      prisma.product.count({ where }),
    ]);

    console.log(`[DEBUG] Found ${products.length} products (Total: ${total})`);

    const formattedProducts = products.map((p: any) => {
      const reviewCount = p._count?.reviews || 0;
      const avgRating = reviewCount > 0 
        ? p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewCount 
        : null;
      
      const { reviews, _count, ...rest } = p;
      return { ...rest, reviewCount, avgRating };
    });

    const pagination = calculatePagination(total, currentPage, take);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: formattedProducts,
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
        images: {
          orderBy: { position: 'asc' },
          select: { id: true, url: true, publicId: true, position: true, isMain: true, variantColor: true }
        },
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
          images: {
            orderBy: { position: 'asc' },
            select: { id: true, url: true, publicId: true, position: true, isMain: true, variantColor: true }
          },
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
    const reviewCount = product.reviews.length;
    const avgRating = reviewCount > 0
      ? product.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / reviewCount
      : null;

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: { ...product, avgRating, reviewCount },
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
        images: {
          orderBy: { position: 'asc' },
          select: { id: true, url: true, publicId: true, position: true, isMain: true, variantColor: true }
        },
        variants: true,
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    }) as any;

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const reviewCount = product.reviews.length;
    const avgRating = reviewCount > 0
      ? product.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / reviewCount
      : null;

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: { ...product, avgRating, reviewCount },
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
        slug: productData.slug || productData.name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
        variants: {
          create: variants,
        },
        images: images ? {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            publicId: img.publicId,
            position: index,
            isMain: index === 0,
            variantColor: img.variantColor || null,
          })),
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
        const incomingSkus = variants.map((v: any) => v.sku).filter(Boolean);
        const incomingIds = variants.map((v: any) => v.id).filter(Boolean);

        // Delete removed variants correctly
        const variantsToDelete = existing.variants.filter(
          (ev: any) => !incomingIds.includes(ev.id) && !incomingSkus.includes(ev.sku)
        );
        const variantIdsToDelete = variantsToDelete.map((v: any) => v.id);

        if (variantIdsToDelete.length > 0) {
          await tx.cartItem.deleteMany({
            where: { variantId: { in: variantIdsToDelete } },
          });
          await tx.variant.deleteMany({
            where: { id: { in: variantIdsToDelete } },
          });
        }

        // Two-pass to avoid SKU unique constraint conflicts
        for (const ev of existing.variants) {
          if (!variantIdsToDelete.includes(ev.id)) {
            await tx.variant.update({
              where: { id: ev.id },
              data: { sku: `_tmp_${ev.id}_${Date.now()}` },
            });
          }
        }

        for (const v of variants) {
          const existingVariant = existing.variants.find(
            (ev: any) => (v.id && ev.id === v.id) || (v.sku && ev.sku === v.sku)
          );

          const { id: _ignore, ...data } = v as any;

          if (existingVariant) {
            await tx.variant.update({
              where: { id: existingVariant.id },
              data: data,
            });
          } else {
            await tx.variant.create({
              data: { ...data, productId: String(id) },
            });
          }
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
          await tx.productImage.createMany({ 
            data: newImages.map((img: any) => ({
              ...img,
              variantColor: img.variantColor || null,
              productId: String(id),
            })) as any 
          });
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

    // Check if product is part of any orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: String(id) }
    });

    if (orderItemsCount > 0) {
      throw new ConflictError("Cannot hard-delete product because it is part of existing orders. Please archive it instead.");
    }

    await prisma.product.delete({
      where: { id: String(id) }
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Product permanently deleted",
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
      where: { product: { status: "ACTIVE" } }
    });

    const seen = new Set();
    const uniqueColors = [];

    for (const v of variants) {
      if (!v.color) continue;
      const key = v.color.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueColors.push({
          name: v.color,
          hex: v.colorHex || "#000000"
        });
      }
    }

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: { colors: uniqueColors },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      category, brand, search, sort, page, limit, status 
    } = req.query;

    const { skip, limit: take, page: currentPage } = getPagination({
      page: Number(page),
      limit: Number(limit),
    });

    const { where, orderBy, include } = buildProductQuery({
      category, brand, search, sort, status,
      adminMode: true
    });

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take,
        skip,
        orderBy,
        include,
      }),
      prisma.product.count({ where }),
    ]);

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

export const updateProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variantColor, isMain, position } = req.body;
    const image = await prisma.productImage.update({
      where: { id: String(req.params.imageId) },
      data: { 
        variantColor: variantColor || null,
        ...(isMain !== undefined && { isMain }),
        ...(position !== undefined && { position }),
      }
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: "Image updated",
      data: image,
    });
  } catch (error) {
    next(error);
  }
};
