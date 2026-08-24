import { Router } from "express";
import { requireAuth } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { authLimiter } from "../../../common/middleware/ratelimit.middleware.js";
import { BroadcasterController } from "./broadcaster.controller.js";

const router = Router();

//* All Routes Working
//public routes
router.get('/', authLimiter, requireAuth, BroadcasterController.getAllBroadcasters);
router.get('/:broadcasterId', authLimiter, requireAuth, BroadcasterController.getBroadcasterById);

//admin routes
router.post('/', requireAuth, authorize("admin"), BroadcasterController.registerBroadcaster);
router.patch('/:broadcasterId', requireAuth, authorize("admin"), BroadcasterController.updateBroadcasterById);
router.delete('/:broadcasterId', requireAuth, authorize("admin"), BroadcasterController.deleteBroadcasterById);

export const broadcasterRoutes = router;