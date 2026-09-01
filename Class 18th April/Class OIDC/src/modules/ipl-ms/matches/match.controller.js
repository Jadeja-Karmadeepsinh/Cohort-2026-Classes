import { ApiResponse } from "../../../common/utils/api-response.js";
import { MatchService } from "./match.service.js";
import { registerMatchSchema, updateMatchSchema, matchIdSchema } from "./dto/match.dto.js";

export class MatchController {
    static async registerMatch(req, res, next) {
        try {
            //1. parse the req body against register match schema
            const validatedData = registerMatchSchema.parse(req.body);

            //2. call the service and pass the validatedata
            const match = await MatchService.registerMatch(validatedData);

            //3. send response created with match object
            ApiResponse.created(
                res,
                "Match registered successfully",
                { match }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getAllMatches(req, res, next) {
        try {
            //1. call the service to get all matches
            const matches = await MatchService.getAllMatches();

            //2. send response ok with matches object
            ApiResponse.ok(
                res,
                "Matches fetched successfully",
                { matches }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getMatchById(req, res, next) {
        try {
            //1. parse req.params against matchidschema 
            const { matchId } = matchIdSchema.parse(req.params);

            //2. call the service and pass the matchid
            const match = await MatchService.getMatchById(matchId);

            //3. send response ok with match object
            ApiResponse.ok(
                res,
                "Match fetched successfully",
                { match }
            );
        } catch (error) {
            next(error);
        }
    }

    static async updateMatchById(req, res, next) {
        try {
            //1. parse the req.params against matchidschema
            const { matchId } = matchIdSchema.parse(req.params);

            //2. parse the req.body againsnt updatematchschema
            const validatedData = updateMatchSchema.parse(req.body);

            //3. call the service and pass matchid and data
            const match = await MatchService.updateMatchById(matchId, validatedData);

            //4. send response ok with match object
            ApiResponse.ok(
                res,
                "Match updated successfully",
                { match }
            );
        } catch (error) {
            next(error);
        }
    }

    static async deleteMatchById(req, res, next) {
        try {
            //1. parse the req.params against matchidschema
            const { matchId } = matchIdSchema.parse(req.params);

            //2. call the service and pass the id
            await MatchService.deleteMatchById(matchId);
            
            //3. send response ok with null
            ApiResponse.ok(
                res,
                "Match deleted successfully",
                null
            );
        } catch (error) {
            next(error);
        }
    }
}