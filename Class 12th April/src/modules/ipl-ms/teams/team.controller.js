import { TeamService } from "./team.service.js";
import { ApiResponse } from "../../../common/utils/api-response.js";
import { registerTeamSchema, updateTeamSchema, teamIdSchema } from "./dto/team.dto.js";
import { id } from "zod/locales";

export class TeamController {
    static async registerTeam(req, res, next) {
        try {
            //1. parse req body against 
            const validatedData = registerTeamSchema.parse(req.body);

            //2. call the register service and pass the validated data
            const team = await TeamService.registerTeam(validatedData);

            //3. send user response created
            ApiResponse.created(res, "Team registered successfully", { team });
        } catch (error) {
            next(error);
        }
    }

    static async getAllTeams(req, res, next) {
        try {
            //1. call service to get all teams
            const teams = await TeamService.getAllTeams();

            //2. send user response ok with all the teams
            ApiResponse.ok(res, "Teams fetched successfully", { teams });
        } catch (error) {
            next(error);
        }
    }

    static async getTeamById(req, res, next) {
        try {
            //1. validate team id against the schema
            const { teamId } = teamIdSchema.parse(req.params);

            //2. pass the id to service and get team
            const team = await TeamService.getTeamById(teamId);

            //3. send user response ok with team
            ApiResponse.ok(res, "Team fetched successfully", { team });
        } catch (error) {
            next(error);
        }
    }

    static async updateTeamById(req, res, next) {
        try {
            //1. validate team id against schema
            const { teamId } = teamIdSchema.parse(req.params);

            //2. validate req body against schema 
            const validateData = updateTeamSchema.parse(req.body);

            //3. call service and pass id and validateddata
            const team = await TeamService.updateTeamById(teamId, validateData);

            //4. send user response ok and updated user
            ApiResponse.ok(res, "Team updated successfully", { team });
        } catch (error) {
            next(error);
        }
    }

    static async deleteTeamById(req, res, next) {
        try {
            //1. validate team id against schema
            const { teamId } = teamIdSchema.parse(req.params);

            //2. call service and pass id
            await TeamService.deleteTeamById(teamId);

            //3. send user response ok 
            ApiResponse.ok(res, "Team deleted successfully", null);
        } catch (error) {
            next(error);
        }
    }
}