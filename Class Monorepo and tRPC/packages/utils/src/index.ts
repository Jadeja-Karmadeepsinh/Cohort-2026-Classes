import z from "zod";

export const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;

// export const createProductSchema = z.object({
//     name: z.string().min(3, "Product name must be at least 3 characters long"),
//     price: z.number().positive("Price must be a positive number"),
//     description: z.string().optional(),
// });

// export type CreateProductSchema = z.infer<typeof createProductSchema>;