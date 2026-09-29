const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";

export const tokenStore = {
    getAccess: () => {
        const raw = localStorage.getItem(ACCESS_KEY);
        return raw ? raw : "";
    },

    getRefresh: () => {
        const raw = localStorage.getItem(REFRESH_KEY);
        return raw ? raw : "";
    },

    getUser: () => {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    },

    set: ({ accessToken, refreshToken, user }) => {
        if(accessToken) {
            localStorage.setItem(ACCESS_KEY, accessToken);
            console.log("Access token stored in localstorage");
        }
        if(refreshToken) {
            localStorage.setItem(REFRESH_KEY, refreshToken);
            console.log("Refresh token stored in localstorage");
        }
        if(user) {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            console.log("User object stored in localstorage");
        }

    },

    clear: () => {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
    }
}