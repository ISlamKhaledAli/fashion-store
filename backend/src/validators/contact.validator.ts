import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().max(200).optional(),
  message: z.string().min(5, "Message must be at least 5 characters").max(5000),
});

export const updateMessageStatusSchema = z.object({
  status: z.enum(["UNREAD", "READ", "ARCHIVED", "REPLIED"]),
  notes: z.string().optional(),
});
