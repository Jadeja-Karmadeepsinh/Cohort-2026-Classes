import { Router } from "express";
import { authLimiter } from "../../../common/middleware/ratelimit.middleware.js";
import { TeamController } from "./team.controller.js";
import { requireAuth } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";

const router = Router();

//* All routes working
//public routes
router.get('/', authLimiter, requireAuth, TeamController.getAllTeams);
router.get('/:teamId', authLimiter, requireAuth, TeamController.getTeamById);

//admin routes
router.post('/', requireAuth, authorize("admin"), TeamController.registerTeam);
router.patch('/:teamId', requireAuth, authorize("admin"), TeamController.updateTeamById);
router.delete('/:teamId', requireAuth, authorize("admin"), TeamController.deleteTeamById);

export const teamRoutes = router;