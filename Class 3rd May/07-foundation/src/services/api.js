import axios from "axios";
import { tokenStore } from "./tokenStore.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
});


//middleware configuration to add accessToken
api.interceptors.request.use((config) => {
    const accessToken = tokenStore.getAccess();

    if(accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

//TODO: intercept the response if it gives errorcode 401 means accessToken is expired
//TODO: now using refreshToken make a request for a new accessToken then set the accessToken in localstorage
//TODO: then make the original request that was the first arrived
api.interceptors.response.use((response) => {


    async (error) => {
        if(error.response?.status === 401) {
            //TODO: make the request for new accessToken 
        }
    }
});