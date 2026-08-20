import z from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id),
    {
        message: "Invalid MongoDB ObjectId"
    }
);

// Create Team
export const registerTeamSchema = z.object({
    name: z
        .string()
        .trim()
        .min(10, "Team name must be at least 10 characters")
        .max(50, "Team name cannot exceed 50 characters"),

    shortHand: z
        .string()
        .trim()
        .min(2, "Team shorthand must be at least 2 characters")
        .max(10, "Team shorthand cannot exceed 10 characters"),

    titles: z
        .number()
        .int("Titles must be an integer")
        .min(0, "Titles cannot be negative")
        .optional(),

    homeVenue: objectId.nullable().optional(),

    captain: objectId.nullable().optional()
});

// Update Team
export const updateTeamSchema = z.object({
    name: z
        .string()
        .trim()
        .min(10, "Team name must be at least 10 characters")
        .max(50, "Team name cannot exceed 50 characters")
        .optional(),

    shortHand: z
        .string()
        .trim()
        .min(2, "Team shorthand must be at least 2 characters")
        .max(10, "Team shorthand cannot exceed 10 characters")
        .optional(),

    titles: z
        .number()
        .int("Titles must be an integer")
        .min(0, "Titles cannot be negative")
        .optional(),

    homeVenue: objectId.nullable().optional(),

    captain: objectId.nullable().optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required for update"
    }
);

// Team ID from params
export const teamIdSchema = z.object({
    teamId: objectId
});