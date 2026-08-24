import Season from './season.model.js';
import PlayerSeasonStats from './player.season.stats.model.js';
import Player from '../players/player.model.js';
import Broadcaster from "../broadcasters/broadcaster.model.js";
import Team from "../teams/team.model.js";
import { ApiError } from '../../../common/utils/api-error.js';

export class SeasonService {
    static async registerSeason(data) {
        // 1. Check if season year already exists
        const existingSeason = await Season.findOne({
            year: data.year
        });

        if (existingSeason) {
            throw ApiError.conflict(
                "A season with this year already exists"
            );
        }

        // 2. Check winner and runner-up are not the same
        if (
            data.winner &&
            data.runnerUp &&
            data.winner === data.runnerUp
        ) {
            throw ApiError.conflict(
                "Winner and runner-up cannot be the same team"
            );
        }

        // 3. Check winner and runner-up teams exist
        const [winner, runnerUp] = await Promise.all([
            data.winner ? Team.findById(data.winner) : null,
            data.runnerUp ? Team.findById(data.runnerUp) : null
        ]);

        if (data.winner && !winner) {
            throw ApiError.notFound(
                "Winner team not found"
            );
        }

        if (data.runnerUp && !runnerUp) {
            throw ApiError.notFound(
                "Runner-up team not found"
            );
        }

        // 4. Check MVP, orange cap and purple cap players exist
        const [mvp, orangeCap, purpleCap] = await Promise.all([
            data.mvp ? Player.findById(data.mvp) : null,
            data.orangeCap ? Player.findById(data.orangeCap) : null,
            data.purpleCap ? Player.findById(data.purpleCap) : null
        ]);

        if (data.mvp && !mvp) {
            throw ApiError.notFound(
                "MVP player not found"
            );
        }

        if (data.orangeCap && !orangeCap) {
            throw ApiError.notFound(
                "Orange cap player not found"
            );
        }

        if (data.purpleCap && !purpleCap) {
            throw ApiError.notFound(
                "Purple cap player not found"
            );
        }

        // 5. Check broadcaster exists
        if (data.broadcaster) {

            const broadcaster = await Broadcaster.findById(
                data.broadcaster
            );

            if (!broadcaster) {
                throw ApiError.notFound(
                    "Broadcaster not found"
                );
            }
        }

        // 6. Create season
        const season = await Season.create(data);

        // 7. Return season
        return season;
    }

    static async getAllSeasons() {
        //1. fetch all the seasons from db
        const seasons = await Season.find()
            .populate("winner", "name shortHand")
            .populate("runnerUp", "name shortHand")
            .populate("mvp", "name")
            .populate("orangeCap", "name")
            .populate("purpleCap", "name")
            .populate("broadcaster", "name")
            .sort({ year: -1 });

        //2. return all the seasons
        return seasons;
    }

    static async getSeasonById(id) {
        //1. check if a season with given id exsists in db or not
        const season = await Season.findById(id)
            .populate("winner", "name shortHand")
            .populate("runnerUp", "name shortHand")
            .populate("mvp", "name")
            .populate("orangeCap", "name")
            .populate("purpleCap", "name")
            .populate("broadcaster", "name");

        //2. if not send error not found
        if (!season) {
            throw ApiError.notFound(
                "Season not found"
            );
        }

        //3. return the season
        return season;
    }

    static async updateSeasonById(id, data) {
        // 1. Find existing season
        const season = await Season.findById(id);

        if (!season) {
            throw ApiError.notFound(
                "Season not found"
            );
        }

        // 2. Determine final values after update
        const finalYear = data.year ?? season.year;

        const finalWinner = data.winner ?? season.winner;

        const finalRunnerUp = data.runnerUp ?? season.runnerUp;

        // 3. Check if another season already has final year
        const existingSeason = await Season.findOne({
            year: finalYear,
            _id: { $ne: id }
        });

        if (existingSeason) {
            throw ApiError.conflict(
                "A season with this year already exists"
            );
        }

        // 4. Check winner and runner-up are not the same
        if (
            finalWinner &&
            finalRunnerUp &&
            finalWinner.toString() === finalRunnerUp.toString()
        ) {
            throw ApiError.conflict(
                "Winner and runner-up cannot be the same team"
            );
        }

        // 5. If winner is being changed, check team exists
        if (data.winner) {

            const winner = await Team.findById(
                data.winner
            );

            if (!winner) {
                throw ApiError.notFound(
                    "Winner team not found"
                );
            }
        }

        // 6. If runner-up is being changed, check team exists
        if (data.runnerUp) {

            const runnerUp = await Team.findById(
                data.runnerUp
            );

            if (!runnerUp) {
                throw ApiError.notFound(
                    "Runner-up team not found"
                );
            }
        }

        // 7. If MVP is being changed, check player exists
        if (data.mvp) {

            const mvp = await Player.findById(
                data.mvp
            );

            if (!mvp) {
                throw ApiError.notFound(
                    "MVP player not found"
                );
            }
        }

        // 8. If orange cap is being changed, check player exists
        if (data.orangeCap) {

            const orangeCap = await Player.findById(
                data.orangeCap
            );

            if (!orangeCap) {
                throw ApiError.notFound(
                    "Orange cap player not found"
                );
            }
        }

        // 9. If purple cap is being changed, check player exists
        if (data.purpleCap) {

            const purpleCap = await Player.findById(
                data.purpleCap
            );

            if (!purpleCap) {
                throw ApiError.notFound(
                    "Purple cap player not found"
                );
            }
        }

        // 10. If broadcaster is being changed, check broadcaster exists
        if (data.broadcaster) {

            const broadcaster = await Broadcaster.findById(
                data.broadcaster
            );

            if (!broadcaster) {
                throw ApiError.notFound(
                    "Broadcaster not found"
                );
            }
        }

        // 11. Update season
        Object.assign(season, data);

        // 12. Save updated season
        await season.save();

        // 13. Return updated season
        return season;
    }

    static async deleteSeasonById(id) {
        //1. check if a season with given id exsists in db or not
        const season = await Season.findById(id);

        //2. if not send error not found
        if (!season) {
            throw ApiError.notFound(
                "Season not found"
            );
        }

        //3. remove the doucment from playeseason stats where season id is this id means delete many from playerseason stats model where id = id 
        await PlayerSeasonStats.deleteMany({
            season: id
        });

        //4. delete the season
        await season.deleteOne();
    }
}