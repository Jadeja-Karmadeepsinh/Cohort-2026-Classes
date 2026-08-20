import { Router } from "express";
import { requireAuth } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { authLimiter } from "../../../common/middleware/ratelimit.middleware.js";
import { VenueController } from "./venue.controller.js";

const router = Router();

//public routes
router.get('/', authLimiter, requireAuth, VenueController.getAllVenues);
router.get('/:venueId', authLimiter, requireAuth, VenueController.getVenueById);

//admin routes
router.post('/', requireAuth, authorize("admin"), VenueController.registerVenue);
router.patch('/:venueId', requireAuth, authorize("admin"), VenueController.updateVenueById);
router.delete('/:venueId', requireAuth, authorize("admin"), VenueController.deleteVenueById);

export const venueRoutes = router;