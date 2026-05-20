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

export const generateFeatures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productName, description, category, brand } = req.body;

    if (!productName || typeof productName !== "string" || !productName.trim()) {
      res.status(400).json({ success: false, error: 'Product name is required' });
      return;
    }

    const systemPrompt = `You are a luxury fashion copywriter. Generate exactly 4 interactive storyboard features for a product.
Return ONLY a valid JSON array of objects. Do not wrap in markdown blocks like \`\`\`json.
Each object must have:
- "icon": A string from this exact list: 'eco', 'architecture', 'history', 'ac_unit', 'shield', 'auto_awesome', 'apparel', 'package_2', 'water_drop', 'local_shipping'
- "title": A short, elegant title (2-3 words).
- "description": A concise, engaging description (1-2 sentences).`;

    const userPrompt = `Product Name: ${productName}
Description: ${description || 'N/A'}
Category: ${category || 'N/A'}
Brand: ${brand || 'N/A'}`;

    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const requestHeaders: Record<string, string> = {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "The Curator Admin AI Assistant",
    };

    let features = [];

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
          max_tokens: 500,
          response_format: { type: "json_object" }
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("[ERROR] OpenRouter features generation failed:", { status: aiResponse.status, errorText });
        res.status(500).json({ success: false, error: `OpenRouter error: ${aiResponse.status} - ${errorText}` });
        return;
      }

      const resJson = (await aiResponse.json()) as any;
      const contentStr = resJson.choices?.[0]?.message?.content?.trim() || "[]";
      
      try {
        features = JSON.parse(contentStr);
        if (features.features && Array.isArray(features.features)) {
          features = features.features;
        } else if (!Array.isArray(features)) {
           features = [];
        }
      } catch (parseErr) {
        console.error("Failed to parse JSON features response:", contentStr);
        features = [];
      }

    } catch (apiError: any) {
      console.error("[ERROR] OpenRouter API call threw an error:", apiError);
      res.status(500).json({ success: false, error: apiError instanceof Error ? apiError.message : String(apiError) });
      return;
    }

    res.status(200).json({
      success: true,
      features
    });
  } catch (error: any) {
    console.error("[ERROR] AI Features Generation failed:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

export const generateAllAccordions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productName, description, category, brand } = req.body;

    if (!productName || typeof productName !== "string" || !productName.trim()) {
      res.status(400).json({ success: false, error: 'Product name is required' });
      return;
    }

    const systemPrompt = `You are a luxury fashion copywriter. Generate the standard detail sections for a product detail page.
Return ONLY a valid JSON array of exactly 3 objects. Do not wrap in markdown blocks like \`\`\`json.
Each object must have:
- "title": Must be one of 'Materials', 'Care', or 'Shipping & Returns'.
- "content": A concise, elegant paragraph or bullet points providing the necessary information.`;

    const userPrompt = `Product Name: ${productName}
Description: ${description || 'N/A'}
Category: ${category || 'N/A'}
Brand: ${brand || 'N/A'}`;

    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const requestHeaders: Record<string, string> = {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "The Curator Admin AI Assistant",
    };

    let details = [];

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
          max_tokens: 600,
          response_format: { type: "json_object" }
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("[ERROR] OpenRouter accordions generation failed:", { status: aiResponse.status, errorText });
        res.status(500).json({ success: false, error: `OpenRouter error: ${aiResponse.status} - ${errorText}` });
        return;
      }

      const resJson = (await aiResponse.json()) as any;
      const contentStr = resJson.choices?.[0]?.message?.content?.trim() || "[]";
      
      try {
        details = JSON.parse(contentStr);
        if (details.details && Array.isArray(details.details)) {
          details = details.details;
        } else if (details.accordions && Array.isArray(details.accordions)) {
          details = details.accordions;
        } else if (!Array.isArray(details)) {
          details = [];
        }
      } catch (parseErr) {
        console.error("Failed to parse JSON accordions response:", contentStr);
        details = [];
      }

    } catch (apiError: any) {
      console.error("[ERROR] OpenRouter API call threw an error:", apiError);
      res.status(500).json({ success: false, error: apiError instanceof Error ? apiError.message : String(apiError) });
      return;
    }

    res.status(200).json({
      success: true,
      details
    });
  } catch (error: any) {
    console.error("[ERROR] AI Accordions Generation failed:", error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

export const analyzeAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { 
      period, 
      totalRevenue, 
      revenueChange, 
      totalOrders, 
      ordersChange, 
      topProducts, 
      categoryBreakdown, 
      newVsReturning, 
      revenueTimeline,
      messages,
      language
    } = req.body;

    const isArabic = language === 'ar';
    const baseSystemPrompt = "You are an expert e-commerce business analyst for a luxury fashion store. Analyze the provided sales data and give the store owner 3-5 specific, actionable insights. Focus on: trends, anomalies, opportunities, and risks. Be direct and specific — use the actual numbers. Format your response as clear paragraphs, not bullet points. Speak like a trusted business advisor, not a report generator.";
    const systemPrompt = isArabic 
      ? baseSystemPrompt + " IMPORTANT: You MUST respond entirely in Arabic."
      : baseSystemPrompt;

    const dataContext = `Analyze this data for the last ${period || 'period'}:
Total Revenue: $${totalRevenue || 0} (${revenueChange || 0}% vs previous period)
Total Orders: ${totalOrders || 0} (${ordersChange || 0}% change)
Top Products: ${JSON.stringify(topProducts || [])}
Category Breakdown: ${JSON.stringify(categoryBreakdown || [])}
Customer Mix: ${newVsReturning?.newCustomers || 0} new, ${newVsReturning?.returning || 0} returning
Daily Revenue: ${JSON.stringify(revenueTimeline || [])}`;

    let apiMessages: any[] = [{ role: "system", content: systemPrompt }];

    if (messages && messages.length > 0) {
      apiMessages.push({ role: "system", content: "Data Context:\n" + dataContext });
      apiMessages.push(...messages.map((m: any) => ({ role: m.role, content: m.content })));
    } else {
      apiMessages.push({ 
        role: "user", 
        content: `${dataContext}\n\nGive me 3-5 specific insights and what I should do about them.` 
      });
    }

    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const requestHeaders: Record<string, string> = {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "The Curator Admin AI Assistant",
    };

    const streamResponse = await fetch(openRouterUrl, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        model: "anthropic/claude-3.5-haiku",
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!streamResponse.ok) {
      const errorText = await streamResponse.text();
      console.error("[ERROR] OpenRouter analyze-analytics generation failed:", { status: streamResponse.status, errorText });
      res.status(500).json({ success: false, error: `OpenRouter error: ${streamResponse.status} - ${errorText}` });
      return;
    }

    if (!streamResponse.body) {
      res.status(500).json({ success: false, message: "Empty response body from AI stream" });
      return;
    }

    // Set streaming headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      if (typeof (streamResponse.body as any).getReader === "function") {
        const reader = (streamResponse.body as any).getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } else {
        for await (const chunk of streamResponse.body as any) {
          res.write(chunk);
        }
      }
    } catch (streamError) {
      console.error("[ERROR] Error in OpenRouter connection stream:", streamError);
    } finally {
      res.end();
    }
  } catch (error: any) {
    console.error("[ERROR] AI Analytics Analysis failed:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
  }
};

