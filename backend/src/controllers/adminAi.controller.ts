import { Request, Response, NextFunction } from "express";
import { adminTools, executeAdminTool } from "../lib/adminTools";
import {
  callOpenRouter,
  pipeSseStream,
  AI_MODELS,
} from "../services/ai.service";
import logger from "../utils/logger";

export const generateDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productName, category, brand, price, colors, sizes, images } =
      req.body;

    if (
      !productName ||
      typeof productName !== "string" ||
      !productName.trim()
    ) {
      res
        .status(400)
        .json({ success: false, error: "Product name is required" });
      return;
    }

    const systemPrompt =
      "You are a luxury fashion copywriter. Write elegant, evocative product descriptions for high-end fashion items. Be concise: 2-3 sentences max. Focus on visual details from the images if provided, material feel, occasion, and style identity. Never use generic phrases like 'high quality' or 'perfect for any occasion'.";

    const categoryText = category ? ` Category: ${category}.` : "";
    const brandText = brand ? ` Brand: ${brand}.` : "";
    const priceText = price && price > 0 ? ` Price: $${price}.` : "";
    const colorsText =
      colors && Array.isArray(colors) && colors.length > 0
        ? ` Available in colors: ${colors.join(", ")}.`
        : "";
    const sizesText =
      sizes && Array.isArray(sizes) && sizes.length > 0
        ? ` Sizes: ${sizes.join(", ")}.`
        : "";

    const imageList: string[] = Array.isArray(images) ? images.slice(0, 4) : [];
    const hasImages = imageList.length > 0;

    const userContent: any[] = [];

    for (const b64 of imageList) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${b64}`,
        },
      });
    }

    userContent.push({
      type: "text",
      text: `Write a product description for: ${productName}.${categoryText}${brandText}${priceText}${colorsText}${sizesText}${hasImages ? " Use the product images above to describe the visual details, silhouette, texture, and styling." : ""} Return ONLY the description text, no quotes, no extra formatting.`,
    });

    let description = "";

    try {
      const aiResponse = await callOpenRouter(
        {
          model: AI_MODELS.HAIKU_4_5,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: hasImages ? userContent : userContent[0].text,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        },
        { title: "The Curator Admin AI Assistant" }
      );

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        logger.error("OpenRouter description generation failed", {
          status: aiResponse.status,
          errorText,
        });
        res
          .status(500)
          .json({
            success: false,
            error: `OpenRouter error: ${aiResponse.status} - ${errorText}`,
          });
        return;
      }

      const resJson = (await aiResponse.json()) as any;
      description = resJson.choices?.[0]?.message?.content?.trim();

      if (!description) {
        res
          .status(500)
          .json({
            success: false,
            error: "Empty description generated from AI service",
          });
        return;
      }
    } catch (apiError: any) {
      logger.error(
        "OpenRouter API call threw an error in generateDescription",
        { error: apiError }
      );
      res
        .status(500)
        .json({
          success: false,
          error:
            apiError instanceof Error ? apiError.message : String(apiError),
        });
      return;
    }

    res.status(200).json({
      success: true,
      description,
    });
  } catch (error: any) {
    logger.error("AI Description Generation failed", { error });
    res
      .status(500)
      .json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
  }
};

export const generateAccordionContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productName, sectionTitle, existingContent, category, brand } =
      req.body;

    if (
      !productName ||
      typeof productName !== "string" ||
      !productName.trim() ||
      !sectionTitle ||
      typeof sectionTitle !== "string" ||
      !sectionTitle.trim()
    ) {
      res
        .status(400)
        .json({
          success: false,
          error: "Product name and section title are required",
        });
      return;
    }

    const systemPrompt =
      "You are a luxury fashion copywriter. Write concise, accurate, and evocative accordion section content for a high-end fashion product page. Return ONLY the content text, formatted as either a clear paragraph or clean bullet points (use - for bullets). Do not include section title or extra quotes.";

    let sectionGuidance = "";
    const lowerTitle = sectionTitle.toLowerCase();
    if (
      lowerTitle.includes("material") ||
      lowerTitle.includes("fabric") ||
      lowerTitle.includes("composition")
    ) {
      sectionGuidance =
        "Focus on premium fabric blend, weave, lining, tactile feel, and garment construction details. Mention care hints if appropriate.";
    } else if (
      lowerTitle.includes("care") ||
      lowerTitle.includes("wash") ||
      lowerTitle.includes("maintenance")
    ) {
      sectionGuidance =
        "Provide professional luxury care instructions: dry clean vs hand wash, ironing temperatures, storage recommendations.";
    } else if (
      lowerTitle.includes("shipping") ||
      lowerTitle.includes("delivery") ||
      lowerTitle.includes("return")
    ) {
      sectionGuidance =
        "Provide standard luxury shipping details: complimentary carbon-neutral delivery, signature required, 30-day effortless returns.";
    } else if (lowerTitle.includes("size") || lowerTitle.includes("fit")) {
      sectionGuidance =
        "Provide fit advice: true to size, model measurements, cut style (tailored, oversized, relaxed).";
    }

    const userPrompt = `Product: ${productName}
Category: ${category || "N/A"}
Brand: ${brand || "N/A"}
Section: ${sectionTitle}
Guidance: ${sectionGuidance}
${existingContent ? `Existing Content to Improve/Expand: ${existingContent}` : ""}

Generate the content for this section.`;

    let content = "";

    try {
      const aiResponse = await callOpenRouter(
        {
          model: AI_MODELS.HAIKU_4_5,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 300,
        },
        { title: "The Curator Admin AI Assistant" }
      );

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        logger.error("OpenRouter accordion generation failed", {
          status: aiResponse.status,
          errorText,
        });
        res
          .status(500)
          .json({
            success: false,
            error: `OpenRouter error: ${aiResponse.status} - ${errorText}`,
          });
        return;
      }

      const resJson = (await aiResponse.json()) as any;
      content = resJson.choices?.[0]?.message?.content?.trim();

      if (!content) {
        res
          .status(500)
          .json({
            success: false,
            error: "Empty content generated from AI service",
          });
        return;
      }
    } catch (apiError: any) {
      logger.error(
        "OpenRouter API call threw an error in generateAccordionContent",
        { error: apiError }
      );
      res
        .status(500)
        .json({
          success: false,
          error:
            apiError instanceof Error ? apiError.message : String(apiError),
        });
      return;
    }

    res.status(200).json({
      success: true,
      content,
    });
  } catch (error: any) {
    logger.error("AI Accordion Content Generation failed", { error });
    res
      .status(500)
      .json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
  }
};

export const generateFeatures = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productName, description, category, brand } = req.body;

    if (
      !productName ||
      typeof productName !== "string" ||
      !productName.trim()
    ) {
      res
        .status(400)
        .json({ success: false, error: "Product name is required" });
      return;
    }

    const systemPrompt = `You are a luxury fashion copywriter. Generate exactly 4 interactive storyboard features for a product.
Return ONLY a valid JSON array of objects. Do not wrap in markdown blocks like \`\`\`json.
Each object must have:
- "icon": A string from this exact list: 'eco', 'architecture', 'history', 'ac_unit', 'shield', 'auto_awesome', 'apparel', 'package_2', 'water_drop', 'local_shipping'
- "title": A short, elegant title (2-3 words).
- "description": A concise, engaging description (1-2 sentences).`;

    const userPrompt = `Product Name: ${productName}
Description: ${description || "N/A"}
Category: ${category || "N/A"}
Brand: ${brand || "N/A"}`;

    let features = [];

    try {
      const aiResponse = await callOpenRouter(
        {
          model: AI_MODELS.HAIKU_4_5,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        { title: "The Curator Admin AI Assistant" }
      );

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        logger.error("OpenRouter features generation failed", {
          status: aiResponse.status,
          errorText,
        });
        res
          .status(500)
          .json({
            success: false,
            error: `OpenRouter error: ${aiResponse.status} - ${errorText}`,
          });
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
        logger.error("Failed to parse JSON features response", { contentStr });
        features = [];
      }
    } catch (apiError: any) {
      logger.error("OpenRouter API call threw an error in generateFeatures", {
        error: apiError,
      });
      res
        .status(500)
        .json({
          success: false,
          error:
            apiError instanceof Error ? apiError.message : String(apiError),
        });
      return;
    }

    res.status(200).json({
      success: true,
      features,
    });
  } catch (error: any) {
    logger.error("AI Features Generation failed", { error });
    res
      .status(500)
      .json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
  }
};

export const generateAllAccordions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productName, description, category, brand } = req.body;

    if (
      !productName ||
      typeof productName !== "string" ||
      !productName.trim()
    ) {
      res
        .status(400)
        .json({ success: false, error: "Product name is required" });
      return;
    }

    const systemPrompt = `You are a luxury fashion copywriter. Generate the standard detail sections for a product detail page.
Return ONLY a valid JSON array of exactly 3 objects. Do not wrap in markdown blocks like \`\`\`json.
Each object must have:
- "title": Must be one of 'Materials', 'Care', or 'Shipping & Returns'.
- "content": A concise, elegant paragraph or bullet points providing the necessary information.`;

    const userPrompt = `Product Name: ${productName}
Description: ${description || "N/A"}
Category: ${category || "N/A"}
Brand: ${brand || "N/A"}`;

    let details = [];

    try {
      const aiResponse = await callOpenRouter(
        {
          model: AI_MODELS.HAIKU_4_5,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 600,
        },
        { title: "The Curator Admin AI Assistant" }
      );

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        logger.error("OpenRouter accordions generation failed", {
          status: aiResponse.status,
          errorText,
        });
        res
          .status(500)
          .json({
            success: false,
            error: `OpenRouter error: ${aiResponse.status} - ${errorText}`,
          });
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
        logger.error("Failed to parse JSON accordions response", {
          contentStr,
        });
        details = [];
      }
    } catch (apiError: any) {
      logger.error(
        "OpenRouter API call threw an error in generateAllAccordions",
        { error: apiError }
      );
      res
        .status(500)
        .json({
          success: false,
          error:
            apiError instanceof Error ? apiError.message : String(apiError),
        });
      return;
    }

    res.status(200).json({
      success: true,
      details,
    });
  } catch (error: any) {
    logger.error("AI Accordions Generation failed", { error });
    res
      .status(500)
      .json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
  }
};

export const analyzeAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { metrics, dateRange, messages } = req.body;

    const systemPrompt = `You are a senior luxury e-commerce merchandise and revenue analyst for The Curator.
Your job is to analyze real-time store analytics, identify anomalies, explain sales velocity patterns, and provide highly actionable growth and merchandising recommendations.
Analyze the provided metrics carefully:
- Date Range: ${dateRange?.preset || "Last 30 Days"}
- Revenue: $${metrics?.totalRevenue || 0} (${metrics?.revenueGrowth || 0}% vs previous period)
- Orders: ${metrics?.totalOrders || 0} (${metrics?.orderGrowth || 0}%)
- AOV: $${metrics?.avgOrderValue || 0} (${metrics?.aovGrowth || 0}%)
- Conversion Rate: ${metrics?.conversionRate || 0}% (${metrics?.cvrGrowth || 0}%)
- Repeat Customer Rate: ${metrics?.repeatCustomerRate || 0}%
- Top Category: ${metrics?.topCategory || "N/A"}
- Stockout Risk Items: ${metrics?.stockoutRiskCount || 0}

Output Structure:
1. Executive Summary: 2 concise sentences on overall business health.
2. Key Wins: 2-3 bullet points highlighting positive trends.
3. Critical Risks: Inventory bottlenecks, falling conversion, or margin threats.
4. Strategic Actions: 3 prioritized, concrete recommendations for merchandising, discounting, or catalog management.

Style: Direct, insightful, executive-level tone. No fluffy intros or platitudes. Format with clean Markdown headers and bullet points.`;

    const apiMessages: any[] = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    if (!messages || messages.length === 0) {
      apiMessages.push({
        role: "user",
        content:
          "Analyze the current store performance metrics and provide executive strategic insights.",
      });
    }

    const streamResponse = await callOpenRouter(
      {
        model: AI_MODELS.HAIKU_3_5,
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 800,
      },
      { title: "The Curator Admin Analytics" }
    );

    if (!streamResponse.ok) {
      const errorText = await streamResponse.text();
      logger.error("OpenRouter analyze-analytics generation failed", {
        status: streamResponse.status,
        errorText,
      });
      res
        .status(500)
        .json({
          success: false,
          error: `OpenRouter error: ${streamResponse.status} - ${errorText}`,
        });
      return;
    }

    if (!streamResponse.body) {
      res
        .status(500)
        .json({
          success: false,
          message: "Empty response body from AI stream",
        });
      return;
    }

    await pipeSseStream(streamResponse.body, res);
  } catch (error: any) {
    logger.error("AI Analytics Analysis failed", { error });
    if (!res.headersSent) {
      res
        .status(500)
        .json({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }
};

export const handleAdminChat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res
        .status(400)
        .json({
          success: false,
          message: "Invalid request: messages array required",
        });
      return;
    }

    const systemPrompt = `You are the Executive AI Operations Assistant for the store administrator of The Curator, a luxury fashion e-commerce brand.
You have live access to the database via specific admin tools.
When asked about store performance, revenue, orders, low-stock inventory, or user stats:
- ALWAYS use the appropriate tool before making statements.
- Never guess numbers or make up store data.
- Keep answers concise, factual, and actionable.
- Format numerical tables and currency cleanly.
- If you notice critical issues (e.g. out-of-stock items, overdue orders), highlight them proactively.`;

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

    while (hasToolCalls && loopCount < maxLoops) {
      logger.debug(
        `Dispatching admin chat query to OpenRouter (Loop ${loopCount + 1})...`
      );

      const response = await callOpenRouter(
        {
          model: AI_MODELS.HAIKU_3,
          messages: apiMessages,
          tools: adminTools,
          tool_choice: "auto",
          stream: false,
          max_tokens: 1000,
          temperature: 0.7,
        },
        { title: "The Curator Admin Assistant" }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("OpenRouter request failed in admin chat", {
          status: response.status,
          errorText,
        });
        res
          .status(500)
          .json({
            success: false,
            message: "Failed to connect to OpenRouter service",
          });
        return;
      }

      const responseData = (await response.json()) as any;
      const choice = responseData.choices?.[0];
      const responseMessage = choice?.message;
      const toolCalls = responseMessage?.tool_calls;

      if (toolCalls && toolCalls.length > 0) {
        logger.debug("Admin tool calls requested", { toolCalls });

        apiMessages.push(responseMessage);

        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          let args = {};
          try {
            args = JSON.parse(toolCall.function.arguments || "{}");
          } catch (err) {
            logger.error("Failed to parse admin tool arguments", {
              error: err,
            });
          }

          logger.debug(`Executing admin tool: ${functionName}`, { args });
          const result = await executeAdminTool(functionName, args);

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

    logger.debug("Dispatching final admin stream query to OpenRouter...");
    const streamResponse = await callOpenRouter(
      {
        model: AI_MODELS.HAIKU_3,
        messages: apiMessages,
        stream: true,
        max_tokens: 600,
        temperature: 0.7,
      },
      { title: "The Curator Admin Assistant" }
    );

    if (!streamResponse.ok) {
      const errorText = await streamResponse.text();
      logger.error("OpenRouter admin final stream failed", {
        status: streamResponse.status,
        errorText,
      });
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to stream final response from OpenRouter",
        });
      return;
    }

    if (!streamResponse.body) {
      res
        .status(500)
        .json({
          success: false,
          message: "Empty final stream response from completions provider",
        });
      return;
    }

    await pipeSseStream(streamResponse.body, res);
  } catch (error) {
    logger.error("Admin Chat Controller failed", { error });
    next(error);
  }
};

export const adminChat = handleAdminChat;
