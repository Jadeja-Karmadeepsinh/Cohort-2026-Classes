import { Router } from "express";
import { requireAuth } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { authLimiter } from "../../../common/middleware/ratelimit.middleware.js";
import { PlayerSeasonStatsController } from "./player.season.stats.controller.js";

const router = Router();

// Public routes

// Get all stats
router.get(
    "/",
    authLimiter,
    requireAuth,
    PlayerSeasonStatsController.getAllStats
);

// Get all stats for a season
router.get(
    "/season/:seasonId",
    authLimiter,
    requireAuth,
    PlayerSeasonStatsController.getStatsBySeason
);

// Get top 10 runs for a season
router.get(
    "/season/:seasonId/top10runs",
    authLimiter,
    requireAuth,
    PlayerSeasonStatsController.getTop10Runs
);

// Get top 10 wickets for a season
router.get(
    "/season/:seasonId/top10wickets",
    authLimiter,
    requireAuth,
    PlayerSeasonStatsController.getTop10Wickets
);

// Get top 10 catches for a season
router.get(
    "/season/:seasonId/top10catches",
    authLimiter,
    requireAuth,
    PlayerSeasonStatsController.getTop10Catches
);

// Get top 10 fours for a season
router.get(
    "/season/:seasonId/top10fours",
    authLimiter,
    requireAuth,
    PlayerSeasonStatsController.getTop10Fours
);

// Get top 10 sixes for a season
router.get(
    "/season/:seasonId/top10sixes",
    authLimiter,
    requireAuth,
    PlayerSeasonStatsController.getTop10Sixes
);

// Get all stats of a player across all seasons
router.get(
    "/player/:playerId",
    authLimiter,
    requireAuth,
    PlayerSeasonStatsController.getStatsByPlayer
);

// Get individual stat document
router.get(
    "/:statId",
    authLimiter,
    requireAuth,
    PlayerSeasonStatsController.getStatById
);


// Admin routes

// Register a stat
router.post(
    "/",
    requireAuth,
    authorize("admin"),
    PlayerSeasonStatsController.registerStat
);

// Update a stat
router.patch(
    "/:statId",
    requireAuth,
    authorize("admin"),
    PlayerSeasonStatsController.updateStatById
);

// Delete a stat
router.delete(
    "/:statId",
    requireAuth,
    authorize("admin"),
    PlayerSeasonStatsController.deleteStatById
);

export const seasonstatsRoutes = router;