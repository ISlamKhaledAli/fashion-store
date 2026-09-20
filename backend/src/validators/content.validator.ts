import { z } from "zod";

export const upsertContentSchema = z.object({
  key: z.string().min(1, "Content key is required"),
  data: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]),
});
