import z from "zod";
import mongoose from "mongoose";

// MongoDB ObjectId validation
const objectId = z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id),
    {
        message: "Invalid MongoDB ObjectId"
    }
);

// Team ID from params
export const teamIdSchema = z.object({
    teamId: objectId
});

// Add sponsor to team
export const addSponsorToTeamSchema = z.object({
    sponsorId: objectId
});

// Team + Sponsor IDs from params
export const teamSponsorParamsSchema = z.object({
    teamId: objectId,
    sponsorId: objectId
});