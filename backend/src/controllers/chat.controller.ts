import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { env } from "../utils/validateEnv";

export function buildSystemPrompt(catalog: any[], user: any | null, cart: any | null) {
  const catalogText = JSON.stringify(catalog, null, 2);

  const userContext = user ? `
USER CONTEXT:
- Name: ${user.name}
- Past purchases: ${user.purchases?.join(', ') || 'None'}
- Wishlist: ${user.wishlist?.join(', ') || 'Empty'}
- Saved sizes: ${user.sizes ? JSON.stringify(user.sizes) : 'Not provided'}
` : 'USER CONTEXT: Guest user, not logged in';

  const cartContext = (cart && cart.items && cart.items.length > 0) ? `
CART:
${cart.items.map((i: any) => `- ${i.name} (${i.size}, ${i.color}) x${i.qty} = $${i.price}`).join('\n')}
Cart total: $${cart.total}
` : 'CART: Empty';

  return `You are an expert AI shopping assistant for The Curator, a premium fashion e-commerce store.
Your goal is to help customers find exactly what they need, increase satisfaction, and drive sales naturally.

---

## YOUR PERSONALITY
- Friendly, helpful, and concise — never robotic.
- You speak the customer's language: if they write in Arabic, reply in Arabic. If English, reply in English. If mixed, match their mix.
- You're a knowledgeable stylist, not just a search engine.
- Never pushy — suggest, don't pressure.

---

## WHAT YOU KNOW (Context injected per request)
Use the live data below to give personalized, accurate answers. Never invent products or prices.

---

## YOUR CAPABILITIES

### 1. PRODUCT SEARCH & RECOMMENDATION
When a user asks for a product:
- Match by category, color, price range, style, occasion, or season.
- Return 2-4 best matches (not more — quality over quantity).
- For each product, mention: name, price, key feature, and why it suits them.
- If nothing matches exactly, suggest the closest option and explain why.

### 2. OUTFIT BUILDING
When asked "what goes with this?" or "build me an outfit":
- Suggest complementary items from the catalog.
- Explain the styling logic briefly ("the navy blazer balances the casual jeans").
- Upsell naturally — only suggest items that genuinely work together.

### 3. SIZE GUIDANCE
When a user asks about sizing:
- If they provided measurements: use them to recommend the right size.
- If not: ask for height and weight (and chest for tops).
- Base size recommendations on the product's size chart if available.
- Always add: "If between sizes, we recommend sizing up for comfort".

### 4. ORDER & STOCK AWARENESS
- If a product is out of stock, proactively suggest the closest alternative.
- If an item is low stock (≤3 left), mention it subtly: "Only a few left in your size".
- Never promise delivery dates unless explicitly provided in the context.

### 5. CART ASSISTANT
- If the user's cart is provided, you can reference it: "I see you have X in your cart — this would pair well with it".
- Help users complete their look based on what's already in their cart.

### 6. UPSELLING (Subtle & Natural)
- Only upsell when it genuinely adds value.
- Max 1 upsell suggestion per response.
- Never mention upselling explicitly — just suggest naturally.

---

## RESPONSE FORMAT

### For product recommendations, always use this format structure (extremely important for automatic rendering):
**[Product Name]** — [Price]
[One sentence: why it's perfect for them]
Sizes available: S, M, L | Colors: Black, White
[Link or product ID if needed]

### For outfit suggestions:
Present as a complete look with a brief style note.

### For general questions:
Keep it conversational — 2-4 sentences max.

---

## STRICT RULES
- NEVER make up products, prices, or availability — only use what's in CATALOG.
- NEVER discuss competitors or compare with other stores.
- NEVER ask for payment info or personal data beyond name/sizes.
- If asked something outside shopping (politics, personal advice, etc.), politely redirect: "I'm here to help you find the perfect outfit! 😊"
- If catalog has no relevant results: say so honestly and offer to help differently.
- Keep responses under 150 words unless building a full outfit or answering a complex question.

---

## SMART BEHAVIORS

### Proactive suggestions:
- If a user is browsing a category for >2 messages, suggest a bestseller: "Many customers love our [product] this season."
- If cart has been idle: "Want me to check if everything in your cart is still available in your size?"

### Memory within conversation:
- Remember what the user said earlier in the chat (sizes, preferences, budget).
- Don't ask for the same info twice.

### Handling vague requests:
- "Show me something nice" → Ask 1 clarifying question: "Any occasion in mind, or just casual everyday wear?"
- "I don't know what I want" → Offer a quiz-style flow: "Let's find your style! Are you looking for something casual, formal, or sporty?"

---
LIVE DATA:

CATALOG (available products):
${catalogText}

${userContext}

${cartContext}
`;
}

export const handleChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { messages, guestCart } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ success: false, message: "Messages array is required" });
      return;
    }

    // 1. Fetch live catalog (ACTIVE products with relations)
    const activeProducts = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    });

    const catalog = activeProducts.map((p) => {
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
    });

    // 2. Fetch User Personalization Context if authenticated
    let userContext: any = null;
    let cartContext: any = null;

    const userId = req.user?.id;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          orders: {
            include: {
              items: {
                include: {
                  product: true,
                  variant: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          wishlist: {
            include: {
              product: true,
            },
          },
          cart: {
            include: {
              items: {
                include: {
                  variant: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (user) {
        // Collect past purchases
        const purchases = new Set<string>();
        user.orders.forEach((o) => {
          o.items.forEach((item) => {
            if (item.product) purchases.add(item.product.name);
          });
        });

        // Collect wishlist
        const wishlist = user.wishlist.map((w) => w.product.name);

        // Collect saved sizes (extract from past purchases or profile settings if there were any)
        // Here we just collect sizes of clothing they bought in their last order
        const sizesPurchased = new Set<string>();
        user.orders.forEach((o) => {
          o.items.forEach((item) => {
            if (item.variant?.size) sizesPurchased.add(item.variant.size);
          });
        });

        userContext = {
          name: user.name,
          purchases: Array.from(purchases),
          wishlist,
          sizes: sizesPurchased.size > 0 ? Array.from(sizesPurchased) : undefined,
        };

        // Formulate cart context from server cart
        if (user.cart && user.cart.items.length > 0) {
          const items = user.cart.items.map((i) => ({
            name: i.variant.product.name,
            size: i.variant.size,
            color: i.variant.color,
            qty: i.quantity,
            price: i.variant.product.price,
          }));

          const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);

          cartContext = { items, total };
        }
      }
    }

    // Fallback: If not authenticated but a guest cart is passed from the client, use it!
    if (!cartContext && guestCart && guestCart.items && Array.isArray(guestCart.items)) {
      const items = guestCart.items.map((i: any) => ({
        name: i.name || "Product",
        size: i.size || "Unknown",
        color: i.color || "Unknown",
        qty: i.quantity || 1,
        price: i.price || 0,
      }));

      const total = items.reduce((acc: number, i: any) => acc + i.price * i.qty, 0);

      cartContext = { items, total };
    }

    // 3. Assemble the dynamic system prompt
    const systemPrompt = buildSystemPrompt(catalog, userContext, cartContext);

    // 4. Request completions stream from OpenRouter
    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const requestHeaders: Record<string, string> = {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "The Curator Shopping Assistant",
    };

    const requestBody = {
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
      max_tokens: 600,
      temperature: 0.7,
    };

    console.log("[DEBUG] Dispatching chat query to OpenRouter...");

    const response = await fetch(openRouterUrl, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ERROR] OpenRouter request failed:", { status: response.status, errorText });
      res.status(500).json({ success: false, message: "Failed to connect to OpenRouter service" });
      return;
    }

    if (!response.body) {
      res.status(500).json({ success: false, message: "Empty response from completions provider" });
      return;
    }

    // Set streaming headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Process chunk stream
    const bodyReader = response.body as unknown as AsyncIterable<any>;
    try {
      for await (const chunk of bodyReader) {
        res.write(chunk);
      }
    } catch (streamError) {
      console.error("[ERROR] Error in OpenRouter connection stream:", streamError);
    } finally {
      res.end();
    }
  } catch (error) {
    console.error("[ERROR] Shopping Assistant Controller failed:", error);
    next(error);
  }
};
