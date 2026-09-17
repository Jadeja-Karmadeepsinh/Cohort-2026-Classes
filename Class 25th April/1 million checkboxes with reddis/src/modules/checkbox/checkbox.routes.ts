import { Router } from "express";
import { CheckBoxController } from "./checkbox.controller.js";

const router = Router();

router.get('/checkboxes', CheckBoxController.getAllCheckBoxes);

export const checkboxRoutes = router;