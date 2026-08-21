import { ApiResponse } from "../../../common/utils/api-response.js";
import { TeamSponsorService } from "./teamSponsor.service.js";
import { teamIdSchema, addSponsorToTeamSchema, teamSponsorParamsSchema } from "./dto/teamSponsor.dto.js";

export class TeamSponsorController {
    static async getTeamSponsors(req, res, next) {
        try {
            //1. parse team id from params against team id schema
            const { teamId } = teamIdSchema.parse(req.params);

            //2. call team sponsor service and pass team id
            const sponsors = await TeamSponsorService.getTeamSponsors(teamId);

            //3. send user ok response with all sponsors of team
            ApiResponse.ok(
                res,
                "Team sponsors fetched successfully",
                { sponsors }
            );
        } catch (error) {
            next(error);
        }
    }

    static async addSponsorToTeam(req, res, next) {
        try {
            //1. parse team id from params against team id schema
            const { teamId } = teamIdSchema.parse(req.params);

            //2. parse req body against add sponsor to team schema
            const { sponsorId } = addSponsorToTeamSchema.parse(req.body);

            //3. call team sponsor service and pass team id and sponsor id
            const teamSponsor = await TeamSponsorService.addSponsorToTeam(
                teamId,
                sponsorId
            );

            //4. send user created response with team sponsor relationship
            ApiResponse.created(
                res,
                "Sponsor added to team successfully",
                { teamSponsor }
            );
        } catch (error) {
            next(error);
        }
    }

    static async removeSponsorFromTeam(req, res, next) {
        try {
            //1. parse team id and sponsor id from params
            const { teamId, sponsorId } = teamSponsorParamsSchema.parse(req.params);

            //2. call team sponsor service and pass team id and sponsor id
            await TeamSponsorService.removeSponsorFromTeam(
                teamId,
                sponsorId
            );

            //3. send user ok response with null
            ApiResponse.ok(
                res,
                "Sponsor removed from team successfully",
                null
            );
        } catch (error) {
            next(error);
        }
    }

    static async getAllTeamsWithSponsors(req, res, next) {
        try {
            const teams = await TeamSponsorService.getAllTeamsWithSponsors();

            ApiResponse.ok(
                res,
                "Teams with sponsors fetched successfully",
                { teams }
            );
        } catch (error) {
            next(error);
        }
    }
}