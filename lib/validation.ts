// lib/validations.ts
import * as z from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  // FIX: Change the second argument to just a message string or a simple object
  subject: z.enum(["General Inquiry", "Language Lessons", "Project Feedback"], {
    error: "Please select an inquiry type",
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message is too long (max 1000 characters)"),
  honeyPot: z.string().max(0, "Bot detected"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;