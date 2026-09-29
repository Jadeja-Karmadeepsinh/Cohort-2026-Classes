import axios from "axios";
import { tokenStore } from "./tokenStore.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
});