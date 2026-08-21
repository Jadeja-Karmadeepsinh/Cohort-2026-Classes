import z from "zod";
import mongoose from "mongoose";

// Create Broadcaster
export const registerBroadcasterSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Broadcaster name must be at least 2 characters")
        .max(100, "Broadcaster name cannot exceed 100 characters"),

    country: z
        .string()
        .trim()
        .min(1, "Country is required"),

    platform: z
        .enum(["TV", "OTT", "TV & OTT"], {
            message: "Platform must be TV, OTT, or TV & OTT"
        })
});

// Update Broadcaster
export const updateBroadcasterSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Broadcaster name must be at least 2 characters")
        .max(100, "Broadcaster name cannot exceed 100 characters")
        .optional(),

    country: z
        .string()
        .trim()
        .min(1, "Country cannot be empty")
        .optional(),

    platform: z
        .enum(["TV", "OTT", "TV & OTT"], {
            message: "Platform must be TV, OTT, or TV & OTT"
        })
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required for update"
    }
);


// Broadcaster ID from params
const objectId = z.string().refine(
    (data) => mongoose.Types.ObjectId.isValid(data),
    {
        message: "Invalid MongoDB ObjectId"
    }
);

export const broadcasterIdSchema = z.object({
    broadcasterId: objectId
});