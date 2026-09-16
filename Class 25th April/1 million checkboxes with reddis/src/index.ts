import path from "node:path";
import { env } from "./common/config/env.js"
import express from "express";
// cookie-parser does not ship with TypeScript declarations.
// @ts-expect-error: The package is used as middleware and has no bundled types.
import cookieParser from 'cookie-parser';

import { authRoutes } from "./modules/auth/auth.routes.js";

const ROOT_DIR = process.cwd();

const app = express();

app.use(express.json());
app.use(cookieParser());


/*
|--------------------------------------------------------------------------
| STATIC FRONTEND
|--------------------------------------------------------------------------
*/
app.use(express.static(path.join(ROOT_DIR, "public")));


/*
|--------------------------------------------------------------------------
| REQUEST LOGGER
|--------------------------------------------------------------------------
*/
if(env.NODE_ENV === "development") {
    app.use((req, _res, next) => {
        console.log(`IP: ${req.ip} REQ: ${req.method} ${req.originalUrl}`);
        next();
    });
}


/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString()
    })
});


/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/
app.use("/api/auth", authRoutes);
// app.use("/api/checkboxes", checkboxRoutes);


/*
|--------------------------------------------------------------------------
| API 404
|--------------------------------------------------------------------------
|
| Important:
| Invalid API requests should receive JSON, NOT index.html.
|
*/
app.use('/api', (_req, res) => {
    return res.status(404).json({
        success: false,
        message: "API route not found"
    });
});


/*
|--------------------------------------------------------------------------
| FRONTEND SPA FALLBACK
|--------------------------------------------------------------------------
*/
app.use((_req, res) => {
    return res.sendFile(path.join(ROOT_DIR, "public", "index.html"));
});


/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
|
| MUST be after all routes and middleware.
|
*/

export default app;