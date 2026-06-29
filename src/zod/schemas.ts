import { z } from "zod";

// Define the schema for incoming user webhook data
export const UserWebhookSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.email("Invalid email address"),
  avatar: z.url("Invalid avatar URL"),
});


export type UserWebhookInput = z.infer<typeof UserWebhookSchema>;

