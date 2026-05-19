import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { env } from "../utils/validateEnv";
import { tools, executeTool } from "../lib/tools";

export function buildSystemPrompt(user: any | null, cart: any | null) {
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

## YOUR CAPABILITIES & TOOLS
You do NOT know the full product catalog. You MUST use the provided tools to search for and details retrieve catalog items:
- Use \`search_products\` to find items matching the search query, category, price, and color filters.
- Use \`get_product_details\` to retrieve full size ranges, color variants, and descriptions for a specific product by its ID.

---

## STRICT RULES
- NEVER make up products, prices, or availability — only speak about products returned by tools.
- Keep responses under 150 words unless building a full outfit or answering a complex question.
- Format product recommendations as:
  **[Product Name]** — $[Price]
  [One sentence: why it's perfect for them]
  Sizes available: S, M, L | Colors: Black, White

---
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

    // 1. Fetch User Personalization Context if authenticated
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

        // Collect saved sizes (clothing bought in last orders)
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

    // 2. Assemble the dynamic system prompt (without catalog!)
    const systemPrompt = buildSystemPrompt(userContext, cartContext);

    // 3. Setup OpenRouter Configuration
    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const requestHeaders: Record<string, string> = {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "The Curator Shopping Assistant",
    };

    // Filter messages to avoid sending internal tool representation if client sent unexpected formats
    const apiMessages: any[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    let loopCount = 0;
    const maxLoops = 3;
    let hasToolCalls = true;

    // Agentic tool-calling loop (limit 3 steps)
    while (hasToolCalls && loopCount < maxLoops) {
      console.log(`[DEBUG] Dispatching chat query to OpenRouter (Loop ${loopCount + 1})...`);

      const response = await fetch(openRouterUrl, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: apiMessages,
          tools: tools,
          tool_choice: "auto",
          stream: false,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[ERROR] OpenRouter request failed:", { status: response.status, errorText });
        res.status(500).json({ success: false, message: "Failed to connect to OpenRouter service" });
        return;
      }

      const responseData = (await response.json()) as any;
      const choice = responseData.choices?.[0];
      const responseMessage = choice?.message;
      const toolCalls = responseMessage?.tool_calls;

      if (toolCalls && toolCalls.length > 0) {
        console.log(`[DEBUG] Tool calls requested:`, toolCalls);
        
        // Push the assistant tool_calls message
        apiMessages.push(responseMessage);

        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          let args = {};
          try {
            args = JSON.parse(toolCall.function.arguments || "{}");
          } catch (err) {
            console.error("[ERROR] Failed to parse tool arguments:", err);
          }

          console.log(`[DEBUG] Executing tool: ${functionName} with args:`, args);
          const result = await executeTool(functionName, args);

          apiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: functionName,
            content: JSON.stringify(result),
          });
        }

        loopCount++;
      } else {
        hasToolCalls = false;
      }
    }

    // Now call OpenRouter for the final streaming text generation
    console.log("[DEBUG] Dispatching final stream query to OpenRouter...");
    const streamResponse = await fetch(openRouterUrl, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: apiMessages,
        stream: true,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!streamResponse.ok) {
      const errorText = await streamResponse.text();
      console.error("[ERROR] OpenRouter final stream failed:", { status: streamResponse.status, errorText });
      res.status(500).json({ success: false, message: "Failed to stream final response from OpenRouter" });
      return;
    }

    if (!streamResponse.body) {
      res.status(500).json({ success: false, message: "Empty final stream response from completions provider" });
      return;
    }

    // Set streaming headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Process chunk stream
    const bodyReader = streamResponse.body as unknown as AsyncIterable<any>;
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
