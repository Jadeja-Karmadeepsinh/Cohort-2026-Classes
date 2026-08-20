import { Router } from "express";
import { authLimiter } from "../../../common/middleware/ratelimit.middleware.js"
import { requireAuth } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { PlayerController } from "./player.controller.js";

const router = Router();

//* All routes working
//register player
//! Authentication + Only admin can create a player
router.post('/', requireAuth, authorize("admin"), PlayerController.registerPlayer);
//get all players
//! Authentication required + rate limited because of public route
router.get('/', authLimiter, requireAuth, PlayerController.getAllPlayers);
//get a specific player
//! Authentication required + rate limited because of public route
router.get('/:playerId', authLimiter, requireAuth, PlayerController.getPlayerById);
//update a specific player
//! Authentication + Only admin can create a player
router.patch('/:playerId', requireAuth, authorize("admin"), PlayerController.updatePlayerById);
//delete a specific player
//! Authentication + Only admin can create a player
router.delete('/:playerId', requireAuth, authorize("admin"), PlayerController.deletePlayerById);

export const playerRoutes = router;


/*

You're basically telling the rate limiter:

Don't perform these particular validation checks.

In your configuration:

xForwardedForHeader: false

means don't run the warning/validation check concerning the X-Forwarded-For header.

And:

trustProxy: false

means don't run the validation check concerning Express's trust proxy configuration.

*/