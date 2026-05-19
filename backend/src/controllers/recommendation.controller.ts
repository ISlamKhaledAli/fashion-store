import { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";
import { prisma } from "../lib/prisma";
import { env } from "../utils/validateEnv";

// Caching layer: 10 minutes (600 seconds) standard TTL
const recommendationCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export const getProductRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const currentProductId = req.params.id as string;

  if (!currentProductId) {
    res.status(400).json({ success: false, message: "Product ID is required" });
    return;
  }

  const userId = req.user?.id;
  const cacheKey = `recommendations:${currentProductId}:${userId || "guest"}`;

  // 1. Check Caching Layer
  const cachedData = recommendationCache.get(cacheKey);
  if (cachedData) {
    console.log(`[RECOMMENDATIONS] Serving cache hit for key: ${cacheKey}`);
    res.status(200).json({ success: true, source: "cached", recommendations: cachedData });
    return;
  }

  // Define Fallback Logic
  const handleFallback = async (reason: string) => {
    console.warn(`[RECOMMENDATIONS] Triggering Prisma Fallback. Reason: ${reason}`);
    try {
      // Step 1: Query popular products in same category excluding current product
      let categoryId = await prisma.product.findUnique({
        where: { slug: currentProductId },
        select: { categoryId: true },
      }).then(p => p?.categoryId);

      if (!categoryId) {
        categoryId = await prisma.product.findUnique({
          where: { id: currentProductId },
          select: { categoryId: true },
        }).then(p => p?.categoryId);
      }

      if (!categoryId) {
        res.status(200).json({ success: true, source: "fallback", recommendations: [] });
        return;
      }

      // Fetch same category active items, take 6
      const fallbackProducts = await prisma.product.findMany({
        where: {
          categoryId,
          id: { not: currentProductId },
          status: "ACTIVE" as any,
        },
        take: 6,
        include: {
          images: true,
          brand: true,
          category: true,
          variants: true,
        },
      });

      res.status(200).json({ success: true, source: "fallback", recommendations: fallbackProducts });
    } catch (fallbackErr) {
      console.error("[RECOMMENDATIONS] Fatal: Fallback query failed:", fallbackErr);
      res.status(500).json({ success: false, message: "Failed to load product recommendations" });
    }
  };

  try {
    // 2. Fetch Current Product Context (support slug first, then ID)
    let currentProduct = (await prisma.product.findUnique({
      where: { slug: currentProductId },
      include: {
        category: true,
        brand: true,
        variants: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
    })) as any;

    if (!currentProduct) {
      currentProduct = (await prisma.product.findUnique({
        where: { id: currentProductId },
        include: {
          category: true,
          brand: true,
          variants: true,
          tags: {
            include: {
              tag: true
            }
          }
        },
      })) as any;
    }

    if (!currentProduct) {
      res.status(404).json({ success: false, message: "Main product not found" });
      return;
    }

    const currentColors = Array.from(new Set(currentProduct.variants.map((v: any) => v.color)));
    const currentTags = currentProduct.tags.map((pt: any) => pt.tag.name);

    // 3. Fetch Cart Exclusion Items
    let cartProductIds: string[] = [];
    if (userId) {
      const userCart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              variant: true
            }
          }
        }
      });
      if (userCart) {
        cartProductIds = userCart.items.map(item => item.variant.productId);
      }
    }

    // 4. Fetch Popularity Signals (Last 30 days order count)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const orderedQuantities = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true
      },
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: "CANCELLED" as any }
        }
      }
    });

    const popularityMap = new Map<string, number>();
    orderedQuantities.forEach(item => {
      popularityMap.set(item.productId, item._sum.quantity || 0);
    });

    // 5. Query Candidate Pool (max 20 matching same category, close price band)
    const priceMin = currentProduct.price * 0.6;
    const priceMax = currentProduct.price * 1.4;

    const candidates = (await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        status: "ACTIVE" as any,
        price: {
          gte: Math.max(priceMin, 1),
          lte: priceMax,
        },
        id: {
          notIn: [currentProduct.id, ...cartProductIds],
        },
        NOT: [
          { name: { contains: "test", mode: "insensitive" } },
          { images: { none: {} } },
        ],
      },
      include: {
        brand: true,
        category: true,
        variants: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })) as any[];

    // Sort candidates in-memory by popularity rank, select top 20
    const sortedCandidates = candidates
      .sort((a, b) => (popularityMap.get(b.id) || 0) - (popularityMap.get(a.id) || 0))
      .slice(0, 20);

    if (sortedCandidates.length === 0) {
      await handleFallback("Empty candidate pool matching current category and price band");
      return;
    }

    // 6. Fetch Logged-in User History Profile (Orders, Wishlist, Measurements)
    let purchaseHistoryText = "guest user";
    let wishlistText = "empty";

    if (userId) {
      // Last 5 orders
      const userOrders = await prisma.order.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  brand: true
                }
              }
            }
          }
        }
      });

      if (userOrders.length > 0) {
        const orderSummaries = userOrders.flatMap(o => 
          o.items.map((item: any) => `${item.product.name} (Category: ${item.product.category.name}, Brand: ${item.product.brand?.name || "Boutique"})`)
        );
        purchaseHistoryText = Array.from(new Set(orderSummaries)).slice(0, 8).join(", ");
      }

      // Wishlist items
      const userWishlist = await prisma.wishlist.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      });

      if (userWishlist.length > 0) {
        wishlistText = Array.from(new Set(userWishlist.map((w: any) => w.product.category.name))).join(", ");
      }
    }

    // 7. Compose Claude AI System and User Prompt
    const systemPrompt = `You are a fashion recommendation engine for a premium boutique. 
Given the current product the customer is viewing and context about their preferences, select the best 4-6 products from the candidate list to recommend.

CONSTRAINTS:
1. Return ONLY a valid JSON array of product IDs in order of relevance, like: ["id1", "id2", "id3", "id4"]
2. Do NOT write any conversational text, pleasantries, formatting, or explanation. Output MUST begin with "[" and end with "]".
3. Select items that complement the current product (e.g. style compatibility).
4. Never recommend the viewed product itself.
5. Provide a variety of brands and ensure recommended products are currently in stock.`;

    const userPrompt = `Current product: ${currentProduct.name}
Category: ${currentProduct.category.name}
Brand: ${currentProduct.brand?.name || "The Curator"}
Price: $${currentProduct.price}
Colors: ${currentColors.join(", ")}
Tags: ${currentTags.join(", ")}

User purchase history: ${purchaseHistoryText}
User wishlist categories: ${wishlistText}

Candidate products (JSON):
${JSON.stringify(sortedCandidates.map((c: any) => ({
  id: c.id,
  name: c.name,
  category: c.category.name,
  brand: c.brand?.name || "Boutique",
  price: c.price,
  colors: Array.from(new Set(c.variants.map((v: any) => v.color))),
  tags: c.tags.map((t: any) => t.tag.name)
})))}

Select the best 4 to 6 product IDs. Return ONLY a raw JSON string list.`;

    // 8. OpenRouter Fetch with 3-second hard timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    
    console.log(`[RECOMMENDATIONS] Sending candidate pool to OpenRouter Claude-3-Haiku...`);
    const aiResponse = await fetch(openRouterUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": env.CLIENT_URL || "http://localhost:3000",
        "X-Title": "The Curator Recommendation System",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!aiResponse.ok) {
      throw new Error(`OpenRouter returned status ${aiResponse.status}`);
    }

    const resJson = (await aiResponse.json()) as any;
    const replyText = resJson.choices?.[0]?.message?.content?.trim();

    if (!replyText) {
      throw new Error("Empty recommendation array from OpenRouter");
    }

    // Find JSON boundaries
    const startIndex = replyText.indexOf("[");
    const endIndex = replyText.lastIndexOf("]");

    if (startIndex === -1 || endIndex === -1) {
      throw new Error(`Invalid Claude array output formatting: ${replyText}`);
    }

    const recommendedIds: string[] = JSON.parse(replyText.slice(startIndex, endIndex + 1));
    console.log(`[RECOMMENDATIONS] Claude successfully selected IDs:`, recommendedIds);

    // 9. Query Full Product Data for recommended IDs preserving order
    const fullProducts = await prisma.product.findMany({
      where: {
        id: { in: recommendedIds },
        status: "ACTIVE" as any,
      },
      include: {
        images: true,
        brand: true,
        category: true,
        variants: true,
      }
    });

    // Reorder results to preserve AI relevance priority list
    const sortedProducts = recommendedIds
      .map(id => fullProducts.find(p => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    if (sortedProducts.length === 0) {
      await handleFallback("AI returned non-matching database IDs");
      return;
    }

    // 10. Cache output for 10 minutes
    recommendationCache.set(cacheKey, sortedProducts);
    
    res.status(200).json({
      success: true,
      source: "ai",
      recommendations: sortedProducts
    });

  } catch (error: any) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      await handleFallback("OpenRouter request timed out (> 3 seconds)");
    } else {
      console.error("[RECOMMENDATIONS] Claude API call failed:", error);
      await handleFallback(error.message || "General API recommendation failure");
    }
  }
};
