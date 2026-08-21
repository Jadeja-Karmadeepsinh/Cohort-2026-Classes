import TeamSponsor from "./teamSponsor.model.js";

import Team from "../teams/team.model.js";
import Sponsor from "./sponsor.model.js";

import { ApiError } from "../../../common/utils/api-error.js";

export class TeamSponsorService {
    static async getTeamSponsors(teamId) {
         //1. check if team exists
        const team = await Team.findById(teamId);

        //2. if team does not exist then send not found error
        if (!team) {
            throw ApiError.notFound("Team not found");
        }

        //3. fetch all sponsors associated with this team
        const teamSponsors = await TeamSponsor.find({
            team: teamId
        }).populate("sponsor");

        //4. return sponsors
        return teamSponsors.map(item => item.sponsor);
        // return teamSponsors;
    }

    static async addSponsorToTeam(teamId, sponsorId) {
        //1. check if team exists
        const team = await Team.findById(teamId);

        //2. if team does not exist then send not found error
        if (!team) {
            throw ApiError.notFound("Team not found");
        }

        //3. check if sponsor exists
        const sponsor = await Sponsor.findById(sponsorId);

        //4. if sponsor does not exist then send not found error
        if (!sponsor) {
            throw ApiError.notFound("Sponsor not found");
        }

        //5. check if this sponsor is already associated with this team
        const existingTeamSponsor = await TeamSponsor.findOne({
            team: teamId,
            sponsor: sponsorId
        });

        //6. if relationship already exists then send conflict error
        if (existingTeamSponsor) {
            throw ApiError.conflict(
                "This sponsor is already associated with this team"
            );
        }

        //7. create team-sponsor relationship
        const teamSponsor = await TeamSponsor.create({
            team: teamId,
            sponsor: sponsorId
        });

        //8. return created relationship
        return teamSponsor;
    }

    static async removeSponsorFromTeam(teamId, sponsorId) {
        //1. check if team exists
        const team = await Team.findById(teamId);

        //2. if team does not exist then send not found error
        if (!team) {
            throw ApiError.notFound("Team not found");
        }

        //3. check if sponsor exists
        const sponsor = await Sponsor.findById(sponsorId);

        //4. if sponsor does not exist then send not found error
        if (!sponsor) {
            throw ApiError.notFound("Sponsor not found");
        }

        //5. check if this relationship exists
        const teamSponsor = await TeamSponsor.findOne({
            team: teamId,
            sponsor: sponsorId
        });

        //6. if relationship does not exist then send not found error
        if (!teamSponsor) {
            throw ApiError.notFound(
                "This sponsor is not associated with this team"
            );
        }

        //7. delete the relationship
        await teamSponsor.deleteOne();
    }

    static async getAllTeamsWithSponsors() {
        const teamSponsors = await TeamSponsor.find()
            .populate("team")
            .populate("sponsor");

        const teams = {};

        for (const teamSponsor of teamSponsors) {
            const teamId = teamSponsor.team._id.toString();

            if (!teams[teamId]) {
                teams[teamId] = {
                    team: teamSponsor.team,
                    sponsors: []
                };
            }

            teams[teamId].sponsors.push(teamSponsor.sponsor);
        }

        return Object.values(teams);
    }
}