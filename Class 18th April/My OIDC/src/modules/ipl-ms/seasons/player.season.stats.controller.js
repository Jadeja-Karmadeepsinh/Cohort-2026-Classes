import { ApiResponse } from "../../../common/utils/api-response.js";
import { PlayerSeasonStatsService } from "./player.season.stats.service.js";
import { registerStatSchema, updateStatSchema, statIdSchema, seasonIdSchema, playerIdSchema } from "./dto/player.season.stats.dto.js";

export class PlayerSeasonStatsController {
    static async getAllStats(req, res, next) {
        try {
            //1. call the service to fetch all the stats
            const stats = await PlayerSeasonStatsService.getAllStats();

            //2. return ok response with all the stats
            return ApiResponse.ok(
                res,
                "All player season stats fetched successfully",
                { stats }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getStatsBySeason(req, res, next) {
        try {
            //1. parse the req.params against seasonIdSchema 
            const { seasonId } = seasonIdSchema.parse(req.params);

            //2. call the service and pass the season id
            const stats = await PlayerSeasonStatsService.getStatsBySeason(seasonId);

            //3. return ok response with stats
            return ApiResponse.ok(
                res, 
                "Player season stats fetched successfully",
                { stats }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getTop10Runs(req, res, next) {
        try {
            //1. parse the req.params against seasonIdSchema 
            const { seasonId } = seasonIdSchema.parse(req.params);

            //2. call the service and pass the season id
            const stats = await PlayerSeasonStatsService.getTop10Runs(seasonId);

            //3. return ok response with stats
            return ApiResponse.ok(
                res, 
                "Top 10 run scorers fetched successfully",
                { stats }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getTop10Wickets(req, res, next) {
        try {
            //1. parse the req.params against seasonIdSchema 
            const { seasonId } = seasonIdSchema.parse(req.params);

            //2. call the service and pass the season id
            const stats = await PlayerSeasonStatsService.getTop10Wickets(seasonId);

            //3. return ok response with stats
            return ApiResponse.ok(
                res,
                "Top 10 wicket takers fetched successfully",
                { stats }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getTop10Catches(req, res, next) {
        try {
            //1. parse the req.params against seasonIdSchema 
            const { seasonId } = seasonIdSchema.parse(req.params);

            //2. call the service and pass the season id
            const stats = await PlayerSeasonStatsService.getTop10Catches(seasonId);

            //3. return ok response with stats
            return ApiResponse.ok(
                res,
                "Top 10 fielders fetched successfully",
                { stats }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getTop10Fours(req, res, next) {
        try {
            //1. parse the req.params against seasonIdSchema
            const { seasonId } = seasonIdSchema.parse(req.params);

            //2. call the service and pass the season id
            const stats = await PlayerSeasonStatsService.getTop10Fours(seasonId);

            //3. return ok response with stats
            return ApiResponse.ok(
                res,
                "Top 10 players by fours fetched successfully",
                { stats }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getTop10Sixes(req, res, next) {
        try {
            //1. parse the req.params against seasonIdSchema 
            const { seasonId } = seasonIdSchema.parse(req.params);

            //2. call the service and pass the season id
            const stats = await PlayerSeasonStatsService.getTop10Sixes(seasonId);

            //3. return ok response with stats
            return ApiResponse.ok(
                res,
                "Top 10 players by sixes fetched successfully",
                { stats }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getStatsByPlayer(req, res, next) {
        try {
            //1. parse the req.params against playerIdSchema
            const { playerId } = playerIdSchema.parse(req.params);

            //2. call the service and pass the player id 
            const stats = await PlayerSeasonStatsService.getStatsByPlayer(playerId);

            //3. return ok response with stats
            return ApiResponse.ok(
                res,
                "Player season stats fetched successfully",
                { stats }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getStatById(req, res, next) {
        try {
            //1. parse the req.params against statIdSchema
            const { statId } = statIdSchema.parse(req.params);

            //2. call the service and pass the statId
            const stat = await PlayerSeasonStatsService.getStatById(statId);

            //3. return ok response with stats
            return ApiResponse.ok(
                res,
                "Player season stat fetched successfully",
                { stat }
            );
        } catch (error) {
            next(error);
        }
    }

    static async registerStat(req, res, next) {
        try {
            //1. parse the req.body against register stat schema
            const data = registerStatSchema.parse(req.body);

            //2. call the service and pass the data
            const stat = await PlayerSeasonStatsService.registerStat(data);

            //3. return created with stats
            return ApiResponse.created(
                res,
                "Player season stat registered successfully",
                { stat }
            );
        } catch (error) {
            next(error);
        }
    }

    static async updateStatById(req, res, next) {
        try {
            //1. parse req.params against statidschema
            const { statId } = statIdSchema.parse(req.params);

            //2. parse req.body against update stats schema
            const data = updateStatSchema.parse(req.body);

            //3. call the service and pass statid and data
            const stat = await PlayerSeasonStatsService.updateStatById(statId, data);

            //4. return ok response with stat
            return ApiResponse.ok(
                res,
                "Player season stat updated successfully",
                { stat }
            );
        } catch (error) {
            next(error);
        }
    }

    static async deleteStatById(req, res, next) {
        try {
            //1. parse req.params against statid schema
            const { statId } = statIdSchema.parse(req.params);

            //2. call the service and pass the statid
            await PlayerSeasonStatsService.deleteStatById(statId);

            //3. return ok response with null
            return ApiResponse.ok(
                res,
                "Player season stat deleted successfully",
                null
            );
        } catch (error) {
            next(error);
        }
    }
}