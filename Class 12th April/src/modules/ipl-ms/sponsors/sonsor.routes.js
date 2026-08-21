import { Router } from "express";
import { requireAuth } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { authLimiter } from "../../../common/middleware/ratelimit.middleware.js";
import { SponsorController } from "./sponsor.controller.js";

const router = Router();

//* All Routes Working
//public routes
router.get('/', authLimiter, requireAuth, SponsorController.getAllSponsors);
router.get('/:sponsorId', authLimiter, requireAuth, SponsorController.getSponsorById);

//admin routes
router.post('/', requireAuth, authorize("admin"), SponsorController.registerSponsor);
router.patch('/:sponsorId', requireAuth, authorize("admin"), SponsorController.updateSponsorById);
router.delete('/:sponsorId', requireAuth, authorize("admin"), SponsorController.deleteSponsorById);

export const sponsorRoutes = router;