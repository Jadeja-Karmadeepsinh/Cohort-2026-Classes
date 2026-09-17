import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../common/utils/api-response.js";
import { CheckBoxService } from "./checkbox.service.js";

export class CheckBoxController {
    static async getAllCheckBoxes(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = await CheckBoxService.getAllCheckBoxes();
            ApiResponse.ok(res, "All checkboxes fetched", data);
        } catch (error) {
            next(error);
        }
    }
}