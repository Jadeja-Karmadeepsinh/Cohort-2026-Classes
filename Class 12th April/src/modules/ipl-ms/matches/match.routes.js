import { Router } from "express";
import { requireAuth } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { authLimiter } from "../../../common/middleware/ratelimit.middleware.js";
import { MatchController } from "./match.controller.js";

const router = Router();

//* All Routes Working
//public routes
router.get('/', authLimiter, requireAuth, MatchController.getAllMatches);
router.get('/:matchId', authLimiter, requireAuth, MatchController.getMatchById);

//admin routes
router.post('/', requireAuth, authorize("admin"), MatchController.registerMatch);
router.patch('/:matchId', requireAuth, authorize("admin"), MatchController.updateMatchById);
router.delete('/:matchId', requireAuth, authorize("admin"), MatchController.deleteMatchById);

export const matchRoutes = router;