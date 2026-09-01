import z from "zod";
import mongoose from "mongoose";

// MongoDB ObjectId validation
const objectId = z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id),
    {
        message: "Invalid MongoDB ObjectId"
    }
);

// Create Sponsor
export const registerSponsorSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Sponsor name must be at least 2 characters")
        .max(100, "Sponsor name cannot exceed 100 characters"),

    industry: z
        .string()
        .trim()
        .optional(),

    country: z
        .string()
        .trim()
        .optional()
});

// Update Sponsor
export const updateSponsorSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Sponsor name must be at least 2 characters")
        .max(100, "Sponsor name cannot exceed 100 characters")
        .optional(),

    industry: z
        .string()
        .trim()
        .optional(),

    country: z
        .string()
        .trim()
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required for update"
    }
);

// Sponsor ID from params
export const sponsorIdSchema = z.object({
    sponsorId: objectId
});