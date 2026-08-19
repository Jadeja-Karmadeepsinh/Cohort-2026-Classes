import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHadler } from './common/middleware/error.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//! all the routes
app.use('/api/auth', authRoutes);

//! global error middleware
app.use(errorHadler);

export default app;