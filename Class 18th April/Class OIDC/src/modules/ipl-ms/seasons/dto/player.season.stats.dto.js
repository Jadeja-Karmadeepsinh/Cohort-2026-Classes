import z from "zod"; 
import mongoose from "mongoose";

// Reusable MongoDB ObjectId validator
const objectId = z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id),
    {
        message: "Invalid MongoDB ObjectId"
    }
);

const statFields = {
    runs: z
        .coerce
        .number({
            message: "Invalid runs"
        })
        .int({
            message: "Runs must be an integer"
        })
        .min(0, {
            message: "Runs cannot be negative"
        }),

    wickets: z
        .coerce
        .number({
            message: "Invalid wickets"
        })
        .int({
            message: "Wickets must be an integer"
        })
        .min(0, {
            message: "Wickets must be an integer"
        })
        .min(0, {
            message: "Wickets cannot be negative"
        }),

    catches: z
        .coerce
        .number({
            message: "Invalid catches"
        })
        .int({
            message: "Catches must be an integer"
        })
        .min(0, {
            message: "Catches cannot be negative"
        }),

    fours: z
        .coerce
        .number({
            message: "Invalid fours"
        })
        .int({
            message: "Fours must be an integer"
        })
        .min(0, {
            message: "Fours cannot be negative"
        }),

    sixes: z
        .coerce
        .number({
            message: "Invalid sixes"
        })
        .int({
            message: "Sixes must be an integer"
        })
        .min(0, {
            message: "Sixes cannot be negative"
        })
};

export const registerStatSchema = z.object({
    player: objectId,

    season: objectId,

    runs: statFields.runs.default(0),

    wickets: statFields.wickets.default(0),

    catches: statFields.catches.default(0),

    fours: statFields.fours.default(0),

    sixes: statFields.sixes.default(0)
});

export const updateStatSchema = z
    .object({
        runs: statFields.runs.optional(),

        wickets: statFields.wickets.optional(),

        catches: statFields.catches.optional(),

        fours: statFields.fours.optional(),

        sixes: statFields.sixes.optional()
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required for update"
        }
    );

export const statIdSchema = z.object({
    statId: objectId
});

export const seasonIdSchema = z.object({
    seasonId: objectId
});

export const playerIdSchema = z.object({
    playerId: objectId
});