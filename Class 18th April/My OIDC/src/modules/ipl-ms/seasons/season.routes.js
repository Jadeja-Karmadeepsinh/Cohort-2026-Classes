import { Router } from "express";
import { requireAuth } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { authLimiter } from "../../../common/middleware/ratelimit.middleware.js";
import { SeasonController } from "./season.controller.js";

const router = Router();

//* ALl Routes Working
//public routes
router.get('/', authLimiter, requireAuth, SeasonController.getAllSeasons);
router.get('/:seasonId', authLimiter, requireAuth, SeasonController.getSeasonById);

//admin routes
router.post('/', requireAuth, authorize("admin"), SeasonController.registerSeason);
router.patch('/:seasonId', requireAuth, authorize("admin"), SeasonController.updateSeasonById);
router.delete('/:seasonId', requireAuth, authorize("admin"), SeasonController.deleteSeasonById);

export const seasonRoutes = router;