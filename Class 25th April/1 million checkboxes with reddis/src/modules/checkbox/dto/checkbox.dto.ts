import z from "zod";

export const checkboxUpdateSchema = z.object({
    checkboxId: z.coerce
        .number()
        .int()
        .min(1)
        .max(600),

    checked: z.boolean(),
});

export type CheckboxUpdateInput = z.infer<typeof checkboxUpdateSchema>;