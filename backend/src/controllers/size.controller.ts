import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { env } from "../utils/validateEnv";

export const handleSizeRecommend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, messages } = req.body;

    if (!productId || !messages || !Array.isArray(messages)) {
      res.status(400).json({ success: false, message: "productId and messages array are required" });
      return;
    }

    // 1. Fetch Product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    const availableSizes = Array.from(new Set(product.variants.map((v) => v.size)));
    const brandSizingNote = product.brand?.name?.toLowerCase().includes("nike")
      ? "runs small, recommend sizing up"
      : product.brand?.name?.toLowerCase().includes("adidas")
      ? "runs slightly large, recommend true to size or half size down"
      : "true to size";

    // 2. Fetch Saved User Measurements if authenticated
    let savedMeasurementsText = "No saved measurements yet";
    const userId = req.user?.id;

    if (userId) {
      const measurements = await prisma.userMeasurements.findUnique({
        where: { userId },
      });

      if (measurements) {
        savedMeasurementsText = `
Height: ${measurements.heightCm ? measurements.heightCm + "cm" : "N/A"}
Weight: ${measurements.weightKg ? measurements.weightKg + "kg" : "N/A"}
Chest: ${measurements.chestCm ? measurements.chestCm + "cm" : "N/A"}
Waist: ${measurements.waistCm ? measurements.waistCm + "cm" : "N/A"}
Hips: ${measurements.hipsCm ? measurements.hipsCm + "cm" : "N/A"}
Shoe EU: ${measurements.shoeEU ? measurements.shoeEU : "N/A"}
Fit Preference: ${measurements.fitPreference || "N/A"}
`;
      }
    }

    // 3. Construct System Prompt
    const systemPrompt = `You are a friendly personal stylist and size expert for The Curator. 
Your job: recommend the perfect size for the specific product the customer is viewing.

PRODUCT CONTEXT:
Name: ${product.name}
Category: ${product.category?.name || "Boutique Fashion"}
Brand: ${product.brand?.name || "The Curator"}
Available sizes: ${availableSizes.join(", ")}
Brand sizing note: ${brandSizingNote}

USER SAVED DATA (if available):
${savedMeasurementsText}

CONVERSATION RULES:
1. Start by asking only ONE question at a time — never dump a form on the user.
2. For clothing: ask height first, then weight, then chest if needed.
3. For shoes: ask their current shoe size in any brand they know, then confirm EU size.
4. If the user says something vague like "I'm medium build" — ask a clarifying follow-up.
5. Once you have enough info (usually 2-3 questions), give a confident recommendation.
6. Format your final recommendation like this:
   - Lead with the size: "I recommend **Size M** for you"
   - Explain why in 1 sentence
   - Add a fit note: "This will fit [slim/relaxed/true to size] on you"
   - If between sizes, recommend both and explain the tradeoff

WHEN YOU HAVE ENOUGH DATA TO SAVE:
Include this JSON block at the END of your message (invisible to user styling):
{"heightCm": 178, "weightKg": 75, "chestCm": 96, "fitPreference": "regular"}
Only include fields you actually collected. Never guess fields the user didn't provide.

TONE: Friendly, confident, concise. Like a helpful friend who works in fashion — not a robot.`;

    // 4. Dispatch query to OpenRouter Claude-3.5-sonnet/Claude-3.7-sonnet
    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const requestHeaders: Record<string, string> = {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "The Curator Size Advisor",
    };

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    console.log(`[DEBUG] Dispatching Sizing query to OpenRouter...`);
    const streamResponse = await fetch(openRouterUrl, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: apiMessages,
        stream: true,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!streamResponse.ok) {
      const errorText = await streamResponse.text();
      console.error("[ERROR] OpenRouter sizing recommendation failed:", { status: streamResponse.status, errorText });
      res.status(500).json({ success: false, message: "Failed to connect to AI recommendation service" });
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

    const bodyReader = streamResponse.body as unknown as AsyncIterable<any>;
    const decoder = new TextDecoder();
    
    let fullText = "";
    let sentLength = 0;

    try {
      for await (const chunk of bodyReader) {
        const chunkString = decoder.decode(chunk, { stream: true });
        const lines = chunkString.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
            if (dataStr === "[DONE]") {
              continue;
            }
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content || "";
              
              if (content) {
                fullText += content;

                // Look for opening brace of JSON block in the full text accumulation
                const jsonStartIndex = fullText.indexOf("{");
                if (jsonStartIndex !== -1) {
                  // We hit a JSON segment! Emit only the text characters prior to the brace
                  const toSend = fullText.slice(sentLength, jsonStartIndex);
                  if (toSend) {
                    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: toSend } }] })}\n\n`);
                    sentLength = jsonStartIndex;
                  }
                } else {
                  // Standard text stream streaming
                  res.write(`data: ${line.slice(6)}\n\n`);
                  sentLength = fullText.length;
                }
              }
            } catch (e) {
              // Ignore split JSON chunks
            }
          }
        }
      }

      // Check if completion accumulated a JSON block, save it, and notify frontend
      const jsonStartIndex = fullText.indexOf("{");
      if (jsonStartIndex !== -1) {
        const jsonStr = fullText.slice(jsonStartIndex).trim();
        try {
          const parsedMeasurements = JSON.parse(jsonStr);
          console.log("[DEBUG] Parsed user measurements from AI response:", parsedMeasurements);

          if (userId) {
            // Upsert measurements into DB
            const heightCm = parsedMeasurements.heightCm ? Math.round(Number(parsedMeasurements.heightCm)) : undefined;
            const weightKg = parsedMeasurements.weightKg ? Number(parsedMeasurements.weightKg) : undefined;
            const chestCm = parsedMeasurements.chestCm ? Math.round(Number(parsedMeasurements.chestCm)) : undefined;
            const waistCm = parsedMeasurements.waistCm ? Math.round(Number(parsedMeasurements.waistCm)) : undefined;
            const hipsCm = parsedMeasurements.hipsCm ? Math.round(Number(parsedMeasurements.hipsCm)) : undefined;
            const shoeEU = parsedMeasurements.shoeEU ? Number(parsedMeasurements.shoeEU) : undefined;
            const fitPreference = parsedMeasurements.fitPreference ? String(parsedMeasurements.fitPreference) : undefined;

            const updateObj: any = {};
            if (heightCm !== undefined) updateObj.heightCm = heightCm;
            if (weightKg !== undefined) updateObj.weightKg = weightKg;
            if (chestCm !== undefined) updateObj.chestCm = chestCm;
            if (waistCm !== undefined) updateObj.waistCm = waistCm;
            if (hipsCm !== undefined) updateObj.hipsCm = hipsCm;
            if (shoeEU !== undefined) updateObj.shoeEU = shoeEU;
            if (fitPreference !== undefined) updateObj.fitPreference = fitPreference;

            await prisma.userMeasurements.upsert({
              where: { userId },
              update: updateObj,
              create: {
                userId,
                ...updateObj,
              },
            });

            // Emit special SSE event triggering the green success toast on the client!
            res.write(`data: ${JSON.stringify({ measurementsSaved: true, measurements: parsedMeasurements })}\n\n`);
          }
        } catch (err) {
          console.error("[ERROR] Failed to parse or record UserMeasurements JSON:", err);
        }
      }
    } catch (streamError) {
      console.error("[ERROR] Sizing stream failed:", streamError);
    } finally {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (error) {
    console.error("[ERROR] Sizing Recommendation failed:", error);
    next(error);
  }
};

export const getMeasurements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const measurements = await prisma.userMeasurements.findUnique({
      where: { userId },
    });

    res.status(200).json({ success: true, data: measurements });
  } catch (error) {
    next(error);
  }
};

export const updateMeasurements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { heightCm, weightKg, chestCm, waistCm, hipsCm, shoeEU, fitPreference } = req.body;

    const data: any = {
      heightCm: heightCm ? Math.round(Number(heightCm)) : null,
      weightKg: weightKg ? Number(weightKg) : null,
      chestCm: chestCm ? Math.round(Number(chestCm)) : null,
      waistCm: waistCm ? Math.round(Number(waistCm)) : null,
      hipsCm: hipsCm ? Math.round(Number(hipsCm)) : null,
      shoeEU: shoeEU ? Number(shoeEU) : null,
      fitPreference: fitPreference || null,
    };

    const measurements = await prisma.userMeasurements.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });

    res.status(200).json({ success: true, data: measurements });
  } catch (error) {
    next(error);
  }
};

export const clearMeasurements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    await prisma.userMeasurements.delete({
      where: { userId },
    });

    res.status(200).json({ success: true, message: "Measurements deleted successfully" });
  } catch (error) {
    next(error);
  }
};
