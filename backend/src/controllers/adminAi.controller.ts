import { Request, Response, NextFunction } from "express";
import { env } from "../utils/validateEnv";

export const generateDescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log("[DEBUG] generateDescription: req.user =", req.user);

  try {
    const { productName, category, brand, price, colors, sizes, images } = req.body;

    if (!productName || typeof productName !== "string" || !productName.trim()) {
      res.status(400).json({ success: false, error: "Product name is required" });
      return;
    }

    const systemPrompt = "You are a luxury fashion copywriter. Write elegant, evocative product descriptions for high-end fashion items. Be concise: 2-3 sentences max. Focus on visual details from the images if provided, material feel, occasion, and style identity. Never use generic phrases like 'high quality' or 'perfect for any occasion'.";

    const categoryText = category ? ` Category: ${category}.` : "";
    const brandText = brand ? ` Brand: ${brand}.` : "";
    const priceText = price && price > 0 ? ` Price: $${price}.` : "";
    const colorsText = colors && Array.isArray(colors) && colors.length > 0 ? ` Available in colors: ${colors.join(", ")}.` : "";
    const sizesText = sizes && Array.isArray(sizes) && sizes.length > 0 ? ` Sizes: ${sizes.join(", ")}.` : "";

    // Build content array — images first (up to 4), then text prompt
    const imageList: string[] = Array.isArray(images) ? images.slice(0, 4) : [];
    const hasImages = imageList.length > 0;

    const userContent: any[] = [];

    // Add images as vision blocks (OpenAI-compatible format for OpenRouter)
    for (const b64 of imageList) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${b64}`,
        },
      });
    }

    // Add text prompt
    userContent.push({
      type: "text",
      text: `Write a product description for: ${productName}.${categoryText}${brandText}${priceText}${colorsText}${sizesText}${hasImages ? " Use the product images above to describe the visual details, silhouette, texture, and styling." : ""} Return ONLY the description text, no quotes, no extra formatting.`,
    });

    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const requestHeaders: Record<string, string> = {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "The Curator Admin AI Assistant",
    };

    let description = "";

    try {
      const aiResponse = await fetch(openRouterUrl, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          model: "anthropic/claude-haiku-4.5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: hasImages ? userContent : userContent[0].text }
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("[ERROR] OpenRouter description generation failed:", { status: aiResponse.status, errorText });
        res.status(500).json({ success: false, error: `OpenRouter error: ${aiResponse.status} - ${errorText}` });
        return;
      }

      const resJson = (await aiResponse.json()) as any;
      description = resJson.choices?.[0]?.message?.content?.trim();

      if (!description) {
        res.status(500).json({ success: false, error: "Empty description generated from AI service" });
        return;
      }
    } catch (apiError: any) {
      console.error("[ERROR] OpenRouter API call threw an error:", apiError);
      res.status(500).json({ success: false, error: apiError instanceof Error ? apiError.message : String(apiError) });
      return;
    }

    res.status(200).json({
      success: true,
      description
    });
  } catch (error: any) {
    console.error("[ERROR] AI Description Generation failed:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

export const generateAccordionContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, productName, category, brand } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }

    const systemPrompt = "You are a luxury fashion copywriter for a high-end fashion brand. Write concise, elegant accordion content for product detail pages. Be specific and informative. No generic filler. Use short paragraphs or clean bullet points depending on the section type.";

    const userPrompt = `Write the accordion content for a section titled: "${title}".
Product: ${productName ?? 'N/A'}.
Category: ${category ?? 'N/A'}.
Brand: ${brand ?? 'N/A'}.

Guidelines by section type:
- Materials / Fabric: describe fabric composition, texture, weight, and feel
- Care Instructions: clear washing, drying, ironing instructions
- Shipping: delivery timeframes, packaging, returns policy summary
- Sizing / Fit: fit type, model size reference, measurement tips
- Other: write relevant, specific content matching the title

Return ONLY the content text, no section title, no quotes, no markdown headers.`;

    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const requestHeaders: Record<string, string> = {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "The Curator Admin AI Assistant",
    };

    let content = "";

    try {
      const aiResponse = await fetch(openRouterUrl, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          model: "anthropic/claude-haiku-4.5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("[ERROR] OpenRouter accordion generation failed:", { status: aiResponse.status, errorText });
        res.status(500).json({ success: false, error: `OpenRouter error: ${aiResponse.status} - ${errorText}` });
        return;
      }

      const resJson = (await aiResponse.json()) as any;
      content = resJson.choices?.[0]?.message?.content?.trim();

      if (!content) {
        res.status(500).json({ success: false, error: "Empty content generated from AI service" });
        return;
      }
    } catch (apiError: any) {
      console.error("[ERROR] OpenRouter API call threw an error:", apiError);
      res.status(500).json({ success: false, error: apiError instanceof Error ? apiError.message : String(apiError) });
      return;
    }

    res.status(200).json({
      success: true,
      content
    });
  } catch (error: any) {
    console.error("[ERROR] AI Accordion Content Generation failed:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

