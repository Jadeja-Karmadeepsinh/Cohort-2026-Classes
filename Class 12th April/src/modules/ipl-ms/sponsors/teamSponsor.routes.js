import { Router } from "express";

import { requireAuth } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { authLimiter } from "../../../common/middleware/ratelimit.middleware.js";

import { TeamSponsorController } from "./teamSponsor.controller.js";

const router = Router();

//* All Routes Working

router.get(
    "/teams/:teamId/sponsors",
    authLimiter,
    requireAuth,
    TeamSponsorController.getTeamSponsors
);

router.post(
    "/teams/:teamId/sponsors",
    requireAuth,
    authorize("admin"),
    TeamSponsorController.addSponsorToTeam
);

router.delete(
    "/teams/:teamId/sponsors/:sponsorId",
    requireAuth,
    authorize("admin"),
    TeamSponsorController.removeSponsorFromTeam
);

router.get(
    "/teams/sponsors",
    authLimiter,
    requireAuth,
    TeamSponsorController.getAllTeamsWithSponsors
);

export const teamSponsorRoutes = router;