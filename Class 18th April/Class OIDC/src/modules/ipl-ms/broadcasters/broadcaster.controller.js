import { ApiResponse } from "../../../common/utils/api-response.js";
import { BroadcasterService } from "./broadcaster.service.js";
import { broadcasterIdSchema, registerBroadcasterSchema, updateBroadcasterSchema } from "./dto/broadcaster.dto.js";

export class BroadcasterController {
    static async registerBroadcaster(req, res, next) {
        try {
            //1. parse the req.body against register broadcaster schema
            const validatedData = registerBroadcasterSchema.parse(req.body);

            //2. call the service and pass the validated data
            const broadcaster = await BroadcasterService.registerBroadcaster(validatedData);

            //3. send user response created with broadcaster
            ApiResponse.created(
                res,
                "Broadcaster registered successfully",
                { broadcaster }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getAllBroadcasters(req, res, next) {
        try {
            //1. call broadcaster service to get all
            const broadcasters = await BroadcasterService.getAllBroadcasters();

            //2. return ok response with all broadcasters
            ApiResponse.ok(
                res,
                "Broadcasters fetched successfully",
                { broadcasters }
            );
        } catch (error) {
            next(error);
        }
    }

    static async getBroadcasterById(req, res, next) {
        try {
            //1. parse req.params against broadcasteridschema
            const { broadcasterId } = broadcasterIdSchema.parse(req.params);

            //2. call the service and pass the id
            const broadcaster = await BroadcasterService.getBroadcasterById(broadcasterId);

            //3. return ok response with broadcaster
            ApiResponse.ok(
                res,
                "Broadcaster fetched successfully",
                { broadcaster }
            );
        } catch (error) {
            next(error);
        }
    }

    static async updateBroadcasterById(req, res, next) {
        try {
            //1. parse req.params against broadcasteridschema
            const { broadcasterId } = broadcasterIdSchema.parse(req.params);

            //2. parse req.body against updatebroadcasterschema
            const validatedData = updateBroadcasterSchema.parse(req.body);

            //3. call the service and pass id and data
            const broadcaster = await BroadcasterService.updateBroadcasterById(broadcasterId, validatedData);

            //4. return ok response with updated broadcaster
            ApiResponse.ok(
                res,
                "Broadcaster updated successfully",
                { broadcaster }
            );
        } catch (error) {
            next(error);
        }
    }

    static async deleteBroadcasterById(req, res, next) {
        try {
            //1. parse req.params against broadcasteridschema
            const { broadcasterId } = broadcasterIdSchema.parse(req.params);

            //2. call the service and pass the id
            await BroadcasterService.deleteBroadcasterById(broadcasterId);

            //3. return ok response with null
            ApiResponse.ok(
                res,
                "Broadcaster deleted successfully",
                null
            );
        } catch (error) {
            next(error);
        }
    }
}