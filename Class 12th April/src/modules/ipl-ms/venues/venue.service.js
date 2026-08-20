import Venue from './venue.model.js';
import Team from '../teams/team.model.js';
import { ApiError } from '../../../common/utils/api-error.js';

export class VenueService {
    static async registerVenue(data) {
        //1. check if the same name venue already exsists or not
        //2. if exsists then send conflict error
        //3. otherwise create venue 
        //4. return venue object
    }

    static async getAllVenues() {
        //1. fetch all the venues
        //2. return all the venues 
    }

    static async getVenueById(id) {
        //1. check if venue with same id exsists in db
        //2. in doesnt exsists then send not found error
        //3. if exsists then send venue back
    }

    static async updateVenueById(id, data) {
        //1. check if venue with id exsists in db 
        //2. if doent then send error back not found
        //3. check if passed name already exsists in db
        //4. if found then send error conflict
        //5. otherwise update the venue object
        //6. return updated venue object back
    }

    static async deleteVenueById(id) {
        //1. check if venue with id exsisits in db
        //2. if not then send error back that not found
        //3. manually derefrence all homevenue as this id in team model\
        //4. delete the venue object from db
    }
}