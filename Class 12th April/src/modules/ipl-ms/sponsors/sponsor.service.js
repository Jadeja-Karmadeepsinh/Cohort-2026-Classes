import { ApiError } from "../../../common/utils/api-error.js";
import Sponsor from "./sponsor.model.js";
import TeamSponsor from "./teamSponsor.model.js";

export class SponsorService {
    static async registerSponsor(data) {
        //1. check if the sponsor with data.name already exsists in db
        const existingSponsor = await Sponsor.findOne({
            name: data.name
        });

        //2. if exsists then send error conflict
        if (existingSponsor) {
            throw ApiError.conflict(
                "A sponsor with this name already exists"
            );
        }

        //3. if not then create sponsor object in db
        const sponsor = await Sponsor.create(data);

        //4. return sponsor object
        return sponsor;
    }

    static async getAllSponsors() {
        //1. fetch all the sponsors from db
        const sponsors = await Sponsor.find();

        //2. return all sponsors
        return sponsors;
    }

    static async getSponsorById(id) {
        //1. check if sponsor with the given id exsists in db
        const sponsor = await Sponsor.findById(id);

        //2. if not then send error not found
        if (!sponsor) {
            throw ApiError.notFound("Sponsor not found");
        }

        //3. if exsists then return sponsor object 
        return sponsor;
    }

    static async updateSponsorById(id, data) {
        //1. check if sponsor with given id exsists in db
        const sponsor = await Sponsor.findById(id);

        //2. if not then send error not found
        if (!sponsor) {
            throw ApiError.notFound("Sponsor not found");
        }

        //3. if data.name given then check another object with id not equal to given id with same name exsists or not
        if (data.name) {
            const existingSponsor = await Sponsor.findOne({
                name: data.name,
                _id: { $ne: id }
            });

            //4. if exsists then send error conflict
            if (existingSponsor) {
                throw ApiError.conflict(
                    "A sponsor with this name already exists"
                );
            }
        }
        
        //5. otherwise update the sponsor document
        Object.assign(sponsor, data);

        await sponsor.save();

        //6. return sponsor object
        return sponsor;
    }

    static async deleteSponsorById(id) {
        //1. check if sponsor with given id exsists in db
        const sponsor = await Sponsor.findById(id);

        //2. if not then send error not found
        if (!sponsor) {
            throw ApiError.notFound("Sponsor not found");
        }

        //3. if exsists then delete that relationship document from junction table
        await TeamSponsor.deleteMany({
            sponsor: id
        });

        //4. delete the sponsor document
        await sponsor.deleteOne();
    }
}