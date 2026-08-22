import { ApiError } from "../../../common/utils/api-error.js";
import PlayerSeasonStats from "./player.season.stats.model.js";
import Season from "./season.model.js";
import Player from "../players/player.model.js";

export class PlayerSeasonStatsService {
    static async getAllStats() {
        //1. query in db to fetch all the stats in playerseasonstats model
        const stats = await PlayerSeasonStats.find()
            .populate("player", "name role team")
            .populate("season", "year")
            .lean();

        //2. return all the stats
        return stats;
    }

    static async getStatsBySeason(seasonId) {
        // Check if season exists
        const season = await Season.findById(seasonId);

        if (!season) {
            throw ApiError.notFound(
                "Season not found"
            );
        }

        // Fetch all stats for the season
        const stats = await PlayerSeasonStats.find({
            season: seasonId
        })
            .populate("player", "name role team")
            .populate("season", "year")
            .sort({ runs: -1 })
            .lean();

        return stats;
    }

    static async getTop10Runs(seasonId) {
        // Check if season exists
        const season = await Season.findById(seasonId);

        if (!season) {
            throw ApiError.notFound(
                "Season not found"
            );
        }

        const stats = await PlayerSeasonStats.find({
            season: seasonId
        })
            .sort({ runs: -1 })
            .limit(10)
            .populate("player", "name role team")
            .populate("season", "year")
            .lean();

        return stats;
    }

    static async getTop10Wickets(seasonId) {
        // Check if season exists
        const season = await Season.findById(seasonId);

        if (!season) {
            throw ApiError.notFound(
                "Season not found"
            );
        }

        const stats = await PlayerSeasonStats.find({
            season: seasonId
        })
            .sort({ wickets: -1 })
            .limit(10)
            .populate("player", "name role team")
            .populate("season", "year")
            .lean();

        return stats;
    }

    static async getTop10Catches(seasonId) {
        // Check if season exists
        const season = await Season.findById(seasonId);

        if (!season) {
            throw ApiError.notFound(
                "Season not found"
            );
        }

        const stats = await PlayerSeasonStats.find({
            season: seasonId
        })
            .sort({ catches: -1 })
            .limit(10)
            .populate("player", "name role team")
            .populate("season", "year")
            .lean();

        return stats;
    }

    static async getTop10Fours(seasonId) {
        // Check if season exists
        const season = await Season.findById(seasonId);

        if (!season) {
            throw ApiError.notFound(
                "Season not found"
            );
        }

        const stats = await PlayerSeasonStats.find({
            season: seasonId
        })
            .sort({ fours: -1 })
            .limit(10)
            .populate("player", "name role team")
            .populate("season", "year")
            .lean();

        return stats;
    }

    static async getTop10Sixes(seasonId) {
        // Check if season exists
        const season = await Season.findById(seasonId);

        if (!season) {
            throw ApiError.notFound(
                "Season not found"
            );
        }

        const stats = await PlayerSeasonStats.find({
            season: seasonId
        })
            .sort({ sixes: -1 })
            .limit(10)
            .populate("player", "name role team")
            .populate("season", "year")
            .lean();

        return stats;
    }

    static async getStatsByPlayer(playerId) {
        // Check if player exists
        const player = await Player.findById(playerId);

        if (!player) {
            throw ApiError.notFound(
                "Player not found"
            );
        }

        const stats = await PlayerSeasonStats.find({
            player: playerId
        })
            .populate("player", "name role team")
            .populate("season", "year")
            .sort({ createdAt: 1 })
            .lean();

        return stats;
    }

    static async getStatById(statId) {
        // Find the stat document
        const stat = await PlayerSeasonStats.findById(statId)
            .populate("player", "name role team")
            .populate("season", "year")
            .lean();

        if(!stat) {
            throw ApiError.notFound(
                "Stat not found"
            );
        }

        return stat;
    }

    static async registerStat(data) {
        const {
            player,
            season,
            runs,
            wickets,
            catches,
            fours,
            sixes
        } = data;

        // Check if player exists
        const existingPlayer = await Player.findById(player);

        if (!existingPlayer) {
            throw ApiError.notFound(
                "Player not found"
            );
        }

        // Check if season exists
        const existingSeason = await Season.findById(season);

        if (!existingSeason) {
            throw ApiError.notFound(
                "Season not found"
            );
        }

        // Check if stats already exist for this player and season
        const existingStats = await PlayerSeasonStats.findOne({
            player,
            season
        });

        if (existingStats) {
            throw ApiError.conflict(
                "Stats for this player and season already exist"
            );
        }

        // Create stats
        const stat = await PlayerSeasonStats.create({
            player,
            season,
            runs,
            wickets,
            catches,
            fours,
            sixes
        });

        // Return populated document
        const populatedStat = await PlayerSeasonStats.findById(stat._id)
            .populate("player", "name role team")
            .populate("season", "year")
            .lean();

        return populatedStat;
    }

    static async updateStatById(statId, data) {
        // Check if stat exists
        const existingStat = await PlayerSeasonStats.findById(statId);

        if (!existingStat) {
            throw ApiError.notFound(
                "Player season stat not found"
            );
        }

        // Update only the fields provided in data
        Object.assign(existingStat, data);

        // Save updated document
        await existingStat.save();

        // Return populated updated document
        const updatedStat = await PlayerSeasonStats.findById(statId)
            .populate("player", "name role team")
            .populate("season", "year")
            .lean();

        return updatedStat;
    }

    static async deleteStatById(statId) {
        // Check if stat exists
        const stat = await PlayerSeasonStats.findById(statId);

        if (!stat) {
            throw ApiError.notFound(
                "Player season stat not found"
            );
        }

        // Delete the stat
        await PlayerSeasonStats.findByIdAndDelete(statId);
    }
}