import Team from './team.model.js';
import Player from '../players/player.model.js';
import { ApiError } from '../../../common/utils/api-error.js';

export class TeamService {
    static async registerTeam(data) {
        //1. check if team already exsists 
        const existingTeam = await Team.findOne({
            $or: [
                { name: data.name },
                { shortHand: data.shortHand }
            ]
        });

        //2. if exsisits then send conflict error
        if(existingTeam) {
            throw ApiError.conflict("A team with this name or shorthand already exists");
        }

        //3. check if given captain is already captain of another team
        if (data.captain) {
            const captain = await Player.findById(data.captain);

            if (!captain) {
                throw ApiError.notFound("Captain/player not found");
            }

            const existingCaptain = await Team.findOne({
                captain: data.captain
            });

            if (existingCaptain) {
                throw ApiError.conflict("This player is already captain of another team");
            }
        }

        //4. if not then create the team
        const team = await Team.create(data);

        //5. return the team
        return team;
    }

    static async getAllTeams() {
        //1. fetch all the teams
        const teams = await Team.find();

        //2. return all the teams
        return teams;
    }

    static async getTeamById(id) {
        //1. check if team with id exsists
        const team = await Team.findById(id);

        //2. if not then send notfounf error
        if(!team) {
            throw ApiError.notFound("Team not found");
        }

        //3. if exisits then return the team
        return team;
    }

    static async updateTeamById(id, data) {
        //1. check if team with same id exsists
        const team = await Team.findById(id);

        //2. if not then send notfound error
        if(!team) {
            throw ApiError.notFound("Team not found");
        }

        //3. check wether team with same name exsists if yes then send error conflict
        if(data.name || data.shortHand) {
            const existingTeam = await Team.findOne({
                $or: [
                    ...(data.name ? [{ name: data.name }] : []),
                    ...(data.shortHand ? [{ shortHand: data.shortHand }] : [])
                ],
                _id: { $ne: id }
            });

            if(existingTeam) {
                throw ApiError.conflict("A team with this name or shorthand already exists");
            }
        }

        //4. check if team with same captain exsusts if yes then send error conflict
        if(data.captain) {
            //check if player exisits first or not
            const captain = await Player.findById(data.captain);

            if(!captain) {
                throw ApiError.notFound("Captain/player not found");
            }

            const existingCaptain = await Team.findOne({
                captain: data.captain,
                _id: { $ne: id }
            });

            if(existingCaptain) {
                throw ApiError.conflict("This player is already captain of another team");
            }
        }

        //5. otherwise update only given fields
        Object.assign(team, data);

        await team.save();

        //6. return updated team
        return team;
    }

    static async deleteTeamById(id) {
        //1. check if team with same id exsists
        const team = await Team.findById(id);

        //2. if not then send notfound error
        if(!team) {
            throw ApiError.notFound("Team not found");
        }

        //3. manually update refrences of players who belongs to team we want to delete
        await Player.updateMany(
            { team: id },
            { $set: { team: null }}
        );

        //4. delete team from db
        await team.deleteOne();
    }
}

/*

One future improvement

Later, when your project gets bigger, consider using MongoDB transactions for deletion:

Delete Team
   ↓
Set Player.team = null
   ↓
Delete Team

Because currently, if Player.updateMany() succeeds but team.deleteOne() fails, your database can be left in an intermediate state.

*/