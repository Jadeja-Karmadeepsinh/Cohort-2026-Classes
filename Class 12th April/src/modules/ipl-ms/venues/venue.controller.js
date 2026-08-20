import { ApiResponse } from "../../../common/utils/api-response.js";
import { VenueService } from "./venue.service.js";
import { registerVenueSchema, updateVenueSchema, venueIdSchema } from "./dto/venue.dto.js";

export class VenueController {
    static async registerVenue(req, res, next) {
        try {
            //1. check the req body against venueregister schema
            const validatedData = registerVenueSchema.parse(req.body);

            //2. pass the validated data to venue service
            const venue = await VenueService.registerVenue(validatedData);

            //3. send user created response with venue object
            ApiResponse.created(res, "Venue registered successfully", { venue });
        } catch (error) {
            next(error);
        }
    }

    static async getAllVenues(req, res, next) {
        try {
            //1. call the venue service 
            const venues = await VenueService.getAllVenues();

            //2. return ok with all the fetched venues
            ApiResponse.ok(res, "Venues fetched successfully", { venues });
        } catch (error) {
            next(error);
        }
    }

    static async getVenueById(req, res, next) {
        try {
            //1. parse the venue id  from params against venue id schema
            const { venueId } = venueIdSchema.parse(req.params);

            //2. call vernue service and pass the id in it
            const venue = await VenueService.getVenueById(venueId);

            //3. send response ok with fetched venue
            ApiResponse.ok(res, "Venue fetched successfully", { venue });
        } catch (error) {
            next(error);
        }
    }
    
    static async updateVenueById(req, res, next) {
        try {
            //1. parse the vernue id from params against idschema
            const { venueId } = venueIdSchema.parse(req.params);

            //2. parse the body against updatevenueschema
            const validatedData = updateVenueSchema.parse(req.body);

            //3. call the service and pass id and data in it
            const venue = await VenueService.updateVenueById(venueId, validatedData);

            //4. return response ok with updated venue
            ApiResponse.ok(res, "Venue updated successfully", { venue });
        } catch (error) {
            next(error);
        }
    }

    static async deleteVenueById(req, res, next) {
        try {
            //1. parse the venue id against id schema
            const { venueId } = venueIdSchema.parse(req.params);

            //2. call the service and pass the id in it
            await VenueService.deleteVenueById(venueId);

            //3. send user ok response with null
            ApiResponse.ok(res, "Venue deleted successfully", null);
        } catch (error) {
            next(error);
        }
    }
}