import axios from "axios";
import { tokenStore } from "./tokenStore.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
});


// ======================================================
// REQUEST INTERCEPTOR
// ======================================================
// Every request made through `api` comes here first.
//
// We get the accessToken from localStorage and attach it
// to the Authorization header.
//
// Authorization:
// Bearer <accessToken>
// ======================================================

api.interceptors.request.use((config) => {
    const accessToken = tokenStore.getAccess();

    if(accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
}); 


// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================
// If the request succeeds, simply return the response.
//
// If backend returns 401, it means our accessToken may
// have expired.
//
// Then:
//
// 1. Get refreshToken
// 2. Call /refresh
// 3. Get new accessToken + refreshToken
// 4. Store new tokens
// 5. Retry the ORIGINAL request
// ======================================================

api.interceptors.response.use(
    // Successful response
    (response) => {
        return response;
    },

    // Error response
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 errors
        if(error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // ==================================================
        // Prevent infinite loop
        // ==================================================
        //
        // If we already retried this request once,
        // don't try refreshing again.
        //
        // Example:
        //
        // /profile → 401
        //      ↓
        // /refresh → fails
        //
        // We DON'T want:
        //
        // /refresh → 401 → /refresh → 401 → ...
        //
        // ==================================================

        if(originalRequest._retry) {
            tokenStore.clear();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        // Get refresh token
        const refreshToken = tokenStore.getRefresh();

        // If there is no refresh token,
        // user cannot refresh the session.
        if (!refreshToken) {
            tokenStore.clear();
            return Promise.reject(error);
        }

        try {
            // ==================================================
            // IMPORTANT
            // ==================================================
            //
            // Don't use `api.post()` here.
            //
            // `api` has our response interceptor.
            //
            // If /refresh itself returns 401,
            // it could trigger the interceptor again.
            //
            // Therefore we use axios.post() directly.
            // ==================================================

            const refreshResponse = await axios.post(
                `${BASE_URL}/auth/refresh`,
                {
                    refreshToken: refreshToken
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

            // ==================================================
            // Save the NEW tokens
            // ==================================================

            tokenStore.set({ accessToken, newRefreshToken });

            // ==================================================
            // Update the ORIGINAL request
            // ==================================================
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // ==================================================
            // RETRY THE ORIGINAL REQUEST
            // ==================================================
            //
            // Example:
            //
            // First:
            //
            // GET /user/profile
            // Authorization: Bearer OLD_TOKEN
            //
            // ↓ 401
            //
            // POST /auth/refresh
            //
            // ↓
            //
            // NEW_TOKEN
            //
            // ↓
            //
            // GET /user/profile
            // Authorization: Bearer NEW_TOKEN
            //
            // ==================================================

            return api(originalRequest);
        } catch (refreshError) {
            // Refresh token itself is invalid/expired/revoked.
            tokenStore.clear();
            return Promise.reject(refreshError);
        }
    }
);