import { ApiResponse } from "../../../common/utils/api-response.js";
import { SeasonService } from "./season.service.js";
import { registerSeasonSchema, updateSeasonSchema, seasonIdSchema } from "./dto/season.dto.js";

export class SeasonController {
    static async registerSeason(req, res, next) {
        try {
            //1. parse req body against register schema
            const data = registerSeasonSchema.parse(req.body);

            //2. call the service and pass the validated data
            const season = await SeasonService.registerSeason(data);

            //3. send response created with season object
            return ApiResponse.created(
                res,
                "Season registered successfully",
                season
            );
        } catch (error) {
            next(error);
        }
    }

    static async getAllSeasons(req, res, next) {
        try {
            //1. call service to get all seasons
            const seasons = await SeasonService.getAllSeasons();

            //2. return response ok with all the seasons
            return ApiResponse.ok(
                res,
                "Seasons fetched successfully",
                { seasons }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getSeasonById(req, res, next) {
        try {
            //1. parse req.params against seasonidschema 
            const { seasonId } = seasonIdSchema.parse(req.params);

            //2. call the service and pass the id
            const season = await SeasonService.getSeasonById(seasonId);

            //3. send response ok with season object
            return ApiResponse.ok(
                res,
                "Season fetched successfully",
                season
            );
        } catch (error) {
            next(error);
        }
    }

    static async updateSeasonById(req, res, next) {
        try {
            //1. parse req.params against seasonidschema
            const { seasonId } = seasonIdSchema.parse(req.params);

            //2. parse req body against update schema
            const data = updateSeasonSchema.parse(req.body);

            //3. call the service and pass the id and data
            const season = await SeasonService.updateSeasonById(seasonId, data);

            //4. send response ok with season object
            return ApiResponse.ok(
                res,
                "Season updated successfully",
                season
            );
        } catch (error) {
            next(error);
        }
    }

    static async deleteSeasonById(req, res, next) {
        try {
            //1. parse req.params against seasonidschema
            const { seasonId } = seasonIdSchema.parse(req.params);

            //2. call the service and pass the id
            await SeasonService.deleteSeasonById(seasonId);

            //3. send response ok with null
            return ApiResponse.ok(
                res,
                "Season deleted successfully",
                null
            );
        } catch (error) {
            next(error);
        }
    }
}