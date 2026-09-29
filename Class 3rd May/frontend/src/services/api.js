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
// REFRESH PROMISE
// ======================================================
//
// This variable stores the CURRENT refresh request.
//
// Why?
//
// Suppose 5 requests receive 401 at the same time.
//
// We DON'T want:
//
// Request 1 → /refresh
// Request 2 → /refresh
// Request 3 → /refresh
// Request 4 → /refresh
// Request 5 → /refresh
//
// Because our backend rotates refresh tokens.
//
// Instead:
//
// Request 1 → /refresh
// Request 2 ─────────┐
// Request 3 ─────────┤
// Request 4 ─────────┼→ WAIT for the SAME refresh
// Request 5 ─────────┘
//
// ======================================================

let refreshPromise = null;


// ======================================================
// REFRESH ACCESS TOKEN
// ======================================================
//
// This function performs the actual refresh request.
//
// IMPORTANT:
//
// We use axios.post() instead of api.post()
//
// because `api` has the response interceptor.
// ======================================================

async function refreshAccessToken() {
    const refreshToken = tokenStore.getRefresh();

    if(!refreshToken) {
        throw new Error("No refresh token available");
    }

    console.log("Refreshing access token...");

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

    const {
        accessToken,
        refreshToken: newRefreshToken
    } = refreshResponse.data;

    // ==================================================
    // SAVE NEW TOKENS
    // ==================================================

    tokenStore.set({
        accessToken,
        refreshToken: newRefreshToken
    });

    console.log("New tokens stored");

    return accessToken;
}


// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================
//
// If the request succeeds:
//
//       return response
//
// If backend returns 401:
//
//       1. Check whether we already retried
//       2. Get/create ONE refresh request
//       3. Wait for refresh
//       4. Get new access token
//       5. Retry ORIGINAL request
//
// ======================================================

api.interceptors.response.use(
    // ==================================================
    // SUCCESSFUL RESPONSE
    // ==================================================
    (response) => {
        return response;
    },

    // ==================================================
    // ERROR RESPONSE
    // ==================================================
    async (error) => {
        const originalRequest = error.config;

        // ==================================================
        // ONLY HANDLE 401 ERRORS
        // ==================================================
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

        try {
            // ==================================================
            // CREATE ONE REFRESH REQUEST
            // ==================================================
            //
            // If refreshPromise doesn't exist:
            //
            //     create refresh request
            //
            // If it already exists:
            //
            //     DON'T create another request
            //
            //     just wait for the existing one.
            //
            // ==================================================

            if(!refreshPromise) {
                // ==================================================
                // IMPORTANT
                // ==================================================
                //
                // Once refresh finishes, reset refreshPromise.
                //
                // `finally` runs whether refresh succeeds
                // or fails.
                //
                // ==================================================

                refreshPromise = refreshAccessToken().finally(() => {
                    refreshPromise = null;
                });
            }

            // ==================================================
            // WAIT FOR REFRESH
            // ==================================================

            const newAccessToken = await refreshPromise;

            // ==================================================
            // Update the ORIGINAL request
            // ==================================================
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

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