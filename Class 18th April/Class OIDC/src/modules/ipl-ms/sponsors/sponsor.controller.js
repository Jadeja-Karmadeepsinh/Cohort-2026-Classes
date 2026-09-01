import { ApiResponse } from "../../../common/utils/api-response.js";
import { SponsorService } from "./sponsor.service.js";
import { registerSponsorSchema, updateSponsorSchema, sponsorIdSchema } from "./dto/sponsor.dto.js";

export class SponsorController {
    static async registerSponsor(req, res, next) {
        try {
            //1. parse the req body against register sponsor schema
            const validatedData = registerSponsorSchema.parse(req.body);

            //2. call the service and pass the validated data
            const sponsor = await SponsorService.registerSponsor(validatedData);

            //3. send user created response with sponsor object
            ApiResponse.created(
                res,
                "Sponsor registered successfully",
                { sponsor }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getAllSponsors(req, res, next) {
        try {
            //1. call service to get all sponsors
            const sponsors = await SponsorService.getAllSponsors();

            //2. send user ok response with all the sponsors
            ApiResponse.ok(
                res,
                "Sponsors fetched successfully",
                { sponsors }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getSponsorById(req, res, next) {
        try {
            //1. parse req params against sponsor id schema
            const { sponsorId } = sponsorIdSchema.parse(req.params);

            //2. call the service and pass the id
            const sponsor = await SponsorService.getSponsorById(sponsorId);

            //3. send user ok response with sponsor object
            ApiResponse.ok(
                res,
                "Sponsor fetched successfully",
                { sponsor }
            );
        } catch (error) {
            next(error);
        }
    }

    static async updateSponsorById(req, res, next) {
        try {
            //1. parse req params against sponsor id schema
            const { sponsorId } = sponsorIdSchema.parse(req.params);

            //2. parse req body against sponsorupdate schema
            const validatedData = updateSponsorSchema.parse(req.body);

            //3. call the service and pass id and data
            const sponsor = await SponsorService.updateSponsorById(sponsorId, validatedData);

            //4. send user ok response with sponsor object
            ApiResponse.ok(
                res,
                "Sponsor updated successfully",
                { sponsor }
            );
        } catch (error) {
            next(error);
        }
    }

    static async deleteSponsorById(req, res, next) {
        try {
            //1. parse req params against sponsor id schema
            const { sponsorId } = sponsorIdSchema.parse(req.params);

            //2. call the service and pass the id
            await SponsorService.deleteSponsorById(sponsorId);

            //3. send user ok response with null
            ApiResponse.ok(
                res,
                "Sponsor deleted successfully",
                null
            );
        } catch (error) {
            next(error);
        }
    }
}