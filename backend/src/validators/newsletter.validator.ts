import { z } from "zod";

export const subscribeNewsletterSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .transform((val) => val.toLowerCase().trim()),
});

export const updateSubscriberStatusSchema = z.object({
  status: z.enum(["SUBSCRIBED", "UNSUBSCRIBED"]),
});
