import z from "zod";
import mongoose from "mongoose";

// MongoDB ObjectId validation
const objectId = z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id),
    {
        message: "Invalid MongoDB ObjectId"
    }
);

// Create Venue
export const registerVenueSchema = z.object({
    name: z
        .string()
        .trim()
        .min(10, "Venue name must be at least 10 characters")
        .max(100, "Venue name cannot exceed 100 characters"),

    city: z
        .string()
        .trim()
        .min(1, "City is required"),

    state: z
        .string()
        .trim()
        .min(1, "State is required"),

    country: z
        .string()
        .trim()
        .min(1, "Country is required"),

    capacity: z
        .number()
        .int("Capacity must be an integer")
        .min(10000, "Capacity must be at least 10000"),

    pitchCondition: z
        .enum([
            "Flat Pitch",
            "Green Pitch",
            "Dry or Dusty Pitch",
            "Hard Pitch",
            "Wet Pitch"
        ])
        .optional(),

    isOperational: z
        .boolean()
        .optional()

});


// Update Venue
export const updateVenueSchema = z.object({
    name: z
        .string()
        .trim()
        .min(10, "Venue name must be at least 10 characters")
        .max(100, "Venue name cannot exceed 100 characters")
        .optional(),

    city: z
        .string()
        .trim()
        .min(1, "City cannot be empty")
        .optional(),

    state: z
        .string()
        .trim()
        .min(1, "State cannot be empty")
        .optional(),

    country: z
        .string()
        .trim()
        .min(1, "Country cannot be empty")
        .optional(),

    capacity: z
        .number()
        .int("Capacity must be an integer")
        .min(10000, "Capacity must be at least 10000")
        .optional(),

    pitchCondition: z
        .enum([
            "Flat Pitch",
            "Green Pitch",
            "Dry or Dusty Pitch",
            "Hard Pitch",
            "Wet Pitch"
        ])
        .optional(),

    isOperational: z
        .boolean()
        .optional()

}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required for update"
    }
);


// Venue ID from params
export const venueIdSchema = z.object({
    venueId: objectId
});