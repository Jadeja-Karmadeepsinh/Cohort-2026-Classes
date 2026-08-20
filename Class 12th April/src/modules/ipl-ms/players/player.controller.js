import { PlayerService } from './player.service.js';
import { ApiResponse } from '../../../common/utils/api-response.js';
import { playerIdSchema, playerRegisterSchema, updatePlayerSchema } from './dto/player.dto.js'

export class PlayerController {
    static async registerPlayer(req, res, next) {
        try {
            //first parse the req body against player register schema
            const validatedData = playerRegisterSchema.parse(req.body);

            //then pass the parsed data to service to regisrer player
            const player = await PlayerService.registerPlayer(validatedData);

            //send user created response
            ApiResponse.created(res, "Player registered successfully", { player });
        } catch (error) {
            next(error);
        }
    }

    static async getAllPlayers(req, res, next) {
        try {
            //call the service to get all the players data
            const players = await PlayerService.getAllPlayers();

            //send user ok response with all the player data
            ApiResponse.ok(res, "All Plyers fetched successfully", { players });
        } catch (error) {
            next(error);
        }
    }

    static async getPlayerById(req, res, next) {
        try {
            //parse the req.param against the playerid schema 
            const { playerId } = playerIdSchema.parse(req.params); 

            //pass the parsed id to service to get the user 
            const player = await PlayerService.getPlayerById(playerId);

            //send user ok response with player object
            ApiResponse.ok(res, `Player fetched successfully`, { player });
        } catch (error) {
            next(error);
        }
    }

    static async updatePlayerById(req, res, next) {
        try {
            //parse the req.params and req.body with playerid schema and playerUpdate schema 
            const { playerId } = playerIdSchema.parse(req.params);

            const validatedData = updatePlayerSchema.parse(req.body);

            //pass both player id and parsed body data to update service
            const player = await PlayerService.updatePlayerById(playerId, validatedData);

            //send user ok response with updated user object
            ApiResponse.ok(res, `Player updated successfully`, { player });
        } catch (error) {
            next(error);
        }
    }

    static async deletePlayerById(req, res, next) {
        try {
            //parse the req.params with playerid schema
            const { playerId } = playerIdSchema.parse(req.params);

            //pass the id to delete service to delete the player
            await PlayerService.deletePlayerById(playerId);

            //send user ok response with null object
            ApiResponse.ok(res, "Player deleted successfully", null);
        } catch (error) {
            next(error);
        }
    }
}