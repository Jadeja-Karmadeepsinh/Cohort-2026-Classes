import z from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id),
    {
        message: "Invalid MongoDB ObjectId"
    }
);

// Create Season
export const registerSeasonSchema = z.object({
    year: z
        .coerce
        .number({
            message: "Invalid season year"
        })
        .int({
            message: "Season year must be an integer"
        })
        .min(2008, {
            message: "Invalid season year"
        }),

    winner: objectId.optional().nullable(),

    runnerUp: objectId.optional().nullable(),

    totalMatches: z
        .coerce
        .number({
            message: "Invalid total matches"
        })
        .int({
            message: "Total matches must be an integer"
        })
        .min(0, {
            message: "Total matches cannot be negative"
        }),

    mvp: objectId.optional().nullable(),

    orangeCap: objectId.optional().nullable(),

    purpleCap: objectId.optional().nullable(),

    broadcaster: objectId.optional().nullable()
}).refine(
    (data) => {
        if(data.winner && data.runnerUp) {
            return data.winner !== data.runnerUp;
        }

        return true;
    },
    {
        message: "Winner and runner-up cannot be the same team",
        path: ["runnerUp"]
    }
);

// Update Season
export const updateSeasonSchema = z.object({
    year: z
        .coerce
        .number({
            message: "Invalid season year"
        })
        .int({
            message: "Season year must be an integer"
        })
        .min(2008, {
            message: "Invalid season year"
        })
        .optional(),

    winner: objectId.optional().nullable(),

    runnerUp: objectId.optional().nullable(),

    totalMatches: z
        .coerce
        .number({
            message: "Invalid total matches"
        })
        .int({
            message: "Total matches must be an integer"
        })
        .min(0, {
            message: "Total matches cannot be negative"
        })
        .optional(),

    mvp: objectId.optional().nullable(),

    orangeCap: objectId.optional().nullable(),

    purpleCap: objectId.optional().nullable(),

    broadcaster: objectId.optional().nullable()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required for update"
    }
).refine(
    (data) => {
        if(data.winner && data.runnerUp) {
            return data.winner !== data.runnerUp;
        }

        return true;
    },
    {
        message: "Winner and runner-up cannot be the same team",
        path: ["runnerUp"]
    }
);

// Season ID from params
export const seasonIdSchema = z.object({
    seasonId: objectId
});