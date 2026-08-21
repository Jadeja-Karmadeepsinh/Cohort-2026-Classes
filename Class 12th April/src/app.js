import express from 'express';
import cookieParser from 'cookie-parser';
import { env } from './common/config/env.js';
import { errorHadler } from './common/middleware/error.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { playerRoutes } from './modules/ipl-ms/players/player.routes.js';
import { teamRoutes } from './modules/ipl-ms/teams/team.routes.js';
import { venueRoutes } from './modules/ipl-ms/venues/venue.routes.js';
import { broadcasterRoutes } from './modules/ipl-ms/broadcasters/broadcaster.routes.js';
import { sponsorRoutes } from './modules/ipl-ms/sponsors/sonsor.routes.js';
import { teamSponsorRoutes } from './modules/ipl-ms/sponsors/teamSponsor.routes.js';
import { matchRoutes } from './modules/ipl-ms/matches/match.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| REQUEST LOGGER
|--------------------------------------------------------------------------
*/
if(env.NODE_ENV === "development") {
    app.use((req, res, next) => {
        console.log(`REQ: ${req.method} ${req.originalUrl}`);
        next();
    })
}

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/
app.get('/health', (req, res) => {
    return res.status(200).json({
        status: "UP",
        timeStamp: new Date().toISOString()
    })
})

//! all the routes
app.use('/api/auth', authRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/venue', venueRoutes);
app.use('/api/broadcaster', broadcasterRoutes);
app.use('/api/sponsor', sponsorRoutes);
app.use('/api/teamsponsor', teamSponsorRoutes);
app.use('/api/match/', matchRoutes);

//! global error middleware
app.use(errorHadler);

export default app;