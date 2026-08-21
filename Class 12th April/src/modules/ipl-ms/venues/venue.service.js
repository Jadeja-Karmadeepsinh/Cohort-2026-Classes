import Venue from './venue.model.js';
import Team from '../teams/team.model.js';
import { ApiError } from '../../../common/utils/api-error.js';

export class VenueService {
    static async registerVenue(data) {
        //1. check if the same name venue already exsists or not
        const existingVenue = await Venue.findOne({
            name: data.name
        });

        //2. if exsists then send conflict error
        if(existingVenue) {
            throw ApiError.conflict("A venue with this name already exists");
        }

        //3. otherwise create venue 
        const venue = await Venue.create(data);

        //4. return venue object
        return venue;
    }

    static async getAllVenues() {
        //1. fetch all the venues
        const venues = await Venue.find();

        //2. return all the venues 
        return venues;
    }

    static async getVenueById(id) {
        //1. check if venue with same id exsists in db
        const venue = await Venue.findById(id);

        //2. in doesnt exsists then send not found error
        if(!venue) {
            throw ApiError.notFound("Venue not found");
        }

        //3. if exsists then send venue back
        return venue;
    }

    static async updateVenueById(id, data) {
        //1. check if venue with id exsists in db 
        const venue = await Venue.findById(id);

        //2. if doent then send error back not found
        if(!venue) {
            throw ApiError.notFound("Venue not found");
        }

        //3. check if passed name already exsists in db
        if(data.name) {
            const existingVenue = await Venue.findOne({
                name: data.name,
                _id: { $ne: id }
            });

            //4. if found then send error conflict
            if(existingVenue) {
                throw ApiError.conflict("A venue with this name already exists");
            }
        }

        //5. otherwise update the venue object
        Object.assign(venue, data);

        await venue.save();

        //6. return updated venue object back
        return venue;
    }

    static async deleteVenueById(id) {
        //1. check if venue with id exsisits in db
        const venue = await Venue.findById(id);

        //2. if not then send error back that not found
        if(!venue) {
            throw ApiError.notFound("Venue not found");
        }

        //3. manually derefrence all homevenue as this id in team model
        await Team.updateMany(
            { homeVenue: id },
            { $set: { homeVenue: null } }
        );

        //4. delete the venue object from db
        await venue.deleteOne();
    }
}