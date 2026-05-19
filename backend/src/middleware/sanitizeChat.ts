import { Request, Response, NextFunction } from "express";

export const sanitizeChat = (req: Request, res: Response, next: NextFunction) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      success: false,
      message: "Messages array is required",
    });
  }

  if (messages.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Invalid message content",
    });
  }

  const forbiddenPhrases = [
    "ignore previous instructions",
    "system prompt",
    "jailbreak",
  ];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (!msg || typeof msg.content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid message content",
      });
    }

    if (msg.content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Invalid message content",
      });
    }

    const lowerContent = msg.content.toLowerCase();

    // Check for malicious prompt injection patterns
    const hasForbidden = forbiddenPhrases.some((phrase) =>
      lowerContent.includes(phrase)
    );

    if (hasForbidden) {
      return res.status(400).json({
        success: false,
        message: "Invalid message content",
      });
    }

    // Strip forbidden phrases (double-safety layer)
    let sanitizedContent = msg.content;
    forbiddenPhrases.forEach((phrase) => {
      const regex = new RegExp(phrase, "gi");
      sanitizedContent = sanitizedContent.replace(regex, "");
    });

    messages[i].content = sanitizedContent;
  }

  next();
};
