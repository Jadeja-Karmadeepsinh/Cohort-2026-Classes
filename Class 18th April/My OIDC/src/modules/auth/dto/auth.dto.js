import z from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long").max(255, "Name must be at most 255 characters long"),
    email: z.string().trim().toLowerCase().email({ message: "Invalid email address format" }),
    password: z.string().min(8, "Password must be at least 8 characters long")
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email({ message: "Invalid email address format" }),
    password: z.string().min(1, "Password is required")
});