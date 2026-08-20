import Player from './player.model.js'
import Team from '../teams/team.model.js'
import { ApiError } from '../../../common/utils/api-error.js'

export class PlayerService {
    static async registerPlayer(data) {
        // 1. If team is provided → check team exists
        if(data.team) {
            const team = await Team.findById(data.team);

            if(!team) {
                throw ApiError.badRequest("Team not found");
            }
        }

        // 2. Create player
        const player = await Player.create(data);

        // 3. Return created player
        return player;
    }

    static async getAllPlayers() {
        // 1. Find all players
        const players = await Player.find();

        // 2. Return players
        return players;
    }

    static async getPlayerById(id) {
        // 1. Find player by ID
        const player = await Player.findById(id);

        // 2. If not found → not found error
        if(!player) {
            throw ApiError.notFound("Player not found");
        }

        // 3. Return player
        return player;
    }

    static async updatePlayerById(id, data) {
        // 1. Find player by ID
        const player = await Player.findById(id);

        // 2. If not found → not found error
        if(!player) {
            throw ApiError.notFound("Player not found");
        }

        // 3. If team is being changed → check team exists
        if(data.team) {
            const team = await Team.findById(data.team);

            if(!team) {
                throw ApiError.badRequest("Team not found");;
            }
        }

        // 4. Update only fields present in data
        Object.assign(player, data);

        await player.save();

        // 5. Return updated player
        return player;
    }

    static async deletePlayerById(id) {
        // 1. Find player by ID
        const player = await Player.findById(id);

        // 2. If not found → not found error
        if(!player) {
            throw ApiError.notFound("Player not found");
        }

        // 3. Delete player
        await player.deleteOne();
    }
}