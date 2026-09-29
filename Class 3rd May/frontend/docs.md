Yes. The idea is actually pretty simple once you see **why the queue is needed**.

The problem is this:

Imagine your React page makes 3 protected API calls at almost the same time:

```text
GET /profile
GET /posts
GET /notifications
```

All three use the same expired access token.

Without a queue:

```text
/profile ───────► 401 ──► refresh ──► new tokens
/posts ─────────► 401 ──► refresh ──► new tokens
/notifications ─► 401 ──► refresh ──► new tokens
```

Now you have **3 refresh requests happening simultaneously**.

That's particularly bad in your backend because your `/refresh` endpoint **rotates the refresh token**:

```text
OLD refresh token
       ↓
refresh #1
       ↓
NEW refresh token
       ↓
OLD token deleted
```

Then refresh #2 may try using the same old refresh token:

```text
OLD refresh token
       ↓
refresh #2
       ↓
❌ Refresh token revoked
```

So instead we want:

```text
/profile ───────► 401 ─┐
                      │
/posts ─────────► 401 ─┼──► ONE refresh request
                      │
/notifications ─► 401 ─┘
                           ↓
                     new tokens
                           ↓
                 all 3 requests retry
```

The trick is a variable called:

```js
let refreshPromise = null;
```

---

# 1. Understand `refreshPromise`

At the top of `api.js`:

```js
let refreshPromise = null;
```

Initially:

```text
refreshPromise
      ↓
    null
```

When the **first** request gets `401`, we start refreshing:

```js
refreshPromise = refreshAccessToken();
```

Now:

```text
refreshPromise
      ↓
Promise
      ↓
"refresh request is currently running"
```

If another request gets `401` while that refresh is still running, we **don't start another refresh**.

We simply do:

```js
await refreshPromise;
```

Meaning:

> "I'll wait for the refresh that's already happening."

---

# 2. Make a separate refresh function

Inside `api.js`, create:

```js
async function refreshAccessToken() {

    const refreshToken = tokenStore.getRefresh();

    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    const response = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {
            refreshToken
        }
    );

    const {
        accessToken,
        refreshToken: newRefreshToken
    } = response.data;

    tokenStore.setTokens(
        accessToken,
        newRefreshToken
    );

    return accessToken;
}
```

Notice something important:

We're using:

```js
axios.post()
```

and **not**:

```js
api.post()
```

because `api` has the interceptors attached.

We don't want:

```text
/api/refresh
      ↓
401
      ↓
response interceptor
      ↓
refresh
      ↓
/api/refresh
      ↓
401
      ↓
...
```

That could become an infinite loop.

---

# 3. Now create the refresh queue

At the top:

```js
let refreshPromise = null;
```

Then your response interceptor becomes:

```js
api.interceptors.response.use(

    (response) => {
        return response;
    },

    async (error) => {

        const originalRequest = error.config;

        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {

            tokenStore.clear();

            return Promise.reject(error);

        }

        originalRequest._retry = true;


        try {

            if (!refreshPromise) {

                refreshPromise = refreshAccessToken();

            }

            const newAccessToken = await refreshPromise;


            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;


            return api(originalRequest);

        } catch (refreshError) {

            tokenStore.clear();

            return Promise.reject(refreshError);

        } finally {

            refreshPromise = null;

        }

    }

);
```

But there is a **small concurrency problem** with putting `refreshPromise = null` in every waiting request's `finally`. So let's understand the safer version.

---

# 4. The safer version

We want only the request that **created** the refresh promise to clean it up.

So:

```js
let refreshPromise = null;
```

Then:

```js
api.interceptors.response.use(

    (response) => {

        return response;

    },

    async (error) => {

        const originalRequest = error.config;


        // Not a 401
        if (error.response?.status !== 401) {

            return Promise.reject(error);

        }


        // Already retried once
        if (originalRequest._retry) {

            tokenStore.clear();

            return Promise.reject(error);

        }


        originalRequest._retry = true;


        try {

            // ==========================================
            // Is another request already refreshing?
            // ==========================================

            if (!refreshPromise) {

                refreshPromise = refreshAccessToken();

                try {

                    await refreshPromise;

                } finally {

                    refreshPromise = null;

                }

            } else {

                // ==========================================
                // Someone else is already refreshing.
                // Just wait for it.
                // ==========================================

                await refreshPromise;

            }


            // ==========================================
            // Refresh completed.
            // Get the NEW access token.
            // ==========================================

            const newAccessToken =
                tokenStore.getAccess();


            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;


            // ==========================================
            // Retry original request
            // ==========================================

            return api(originalRequest);

        } catch (refreshError) {

            tokenStore.clear();

            return Promise.reject(refreshError);

        }

    }

);
```

This is the core implementation.

---

# 5. Let's dry-run it

This is the important part.

Suppose:

```text
accessToken = OLD_ACCESS
refreshToken = OLD_REFRESH
```

And three requests happen:

```text
A = /profile
B = /posts
C = /notifications
```

All three send:

```http
Authorization: Bearer OLD_ACCESS
```

Backend:

```text
A → 401
B → 401
C → 401
```

---

### Request A reaches interceptor first

It checks:

```js
if (!refreshPromise)
```

Currently:

```js
refreshPromise === null
```

So:

```js
refreshPromise = refreshAccessToken();
```

Now:

```text
refreshPromise
      ↓
Promise
      ↓
POST /auth/refresh
```

A waits:

```js
await refreshPromise;
```

---

### Request B reaches interceptor

B checks:

```js
if (!refreshPromise)
```

But now:

```text
refreshPromise !== null
```

So B does **not** call refresh.

Instead:

```js
await refreshPromise;
```

B waits for A's refresh.

---

### Request C reaches interceptor

Same thing.

```js
await refreshPromise;
```

C waits.

So the situation is now:

```text
                 refreshPromise
                      │
              POST /auth/refresh
                      │
            ┌─────────┼─────────┐
            ↓         ↓         ↓
        Request A  Request B  Request C
           wait       wait       wait
```

Only **one** refresh request exists.

---

# 6. Backend returns new tokens

Suppose:

```json
{
    "accessToken": "NEW_ACCESS",
    "refreshToken": "NEW_REFRESH"
}
```

`refreshAccessToken()` executes:

```js
tokenStore.setTokens(
    accessToken,
    newRefreshToken
);
```

Now localStorage contains:

```text
accessToken  = NEW_ACCESS
refreshToken = NEW_REFRESH
```

And:

```js
return accessToken;
```

returns:

```text
NEW_ACCESS
```

---

# 7. All waiting requests continue

A's:

```js
await refreshPromise;
```

finishes.

Then:

```js
const newAccessToken =
    tokenStore.getAccess();
```

gets:

```text
NEW_ACCESS
```

Then:

```js
originalRequest.headers.Authorization =
    `Bearer ${newAccessToken}`;
```

So A becomes:

```http
GET /profile
Authorization: Bearer NEW_ACCESS
```

Then:

```js
return api(originalRequest);
```

retries it.

---

B does exactly the same:

```http
GET /posts
Authorization: Bearer NEW_ACCESS
```

C:

```http
GET /notifications
Authorization: Bearer NEW_ACCESS
```

So:

```text
             ONE refresh
                  │
           NEW_ACCESS
                  │
        ┌─────────┼─────────┐
        ↓         ↓         ↓
     /profile   /posts   /notifications
        ↓         ↓         ↓
       200       200       200
```

That's the queue.

---

# 8. Why `_retry` is still necessary

You might wonder:

> "If we're already controlling refresh with `refreshPromise`, why do we need `_retry`?"

Because imagine the refresh succeeds, but then the new access token is somehow invalid.

We retry:

```text
/profile
   ↓
401
   ↓
refresh
   ↓
NEW_ACCESS
   ↓
/profile again
   ↓
401
```

Without `_retry`, the response interceptor sees another `401` and tries refreshing again.

Potentially:

```text
401
 ↓
refresh
 ↓
401
 ↓
refresh
 ↓
401
 ↓
refresh
 ↓
...
```

So:

```js
originalRequest._retry = true;
```

means:

> "This particular request has already gone through the refresh process once."

If it gets another 401, stop.

---

# 9. Your complete `api.js`

So your final `api.js` can look like this:

```js
import axios from "axios";

import { tokenStore } from "./tokenStore.js";


const BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000/api";


export const api = axios.create({

    baseURL: BASE_URL,

    headers: {
        "Content-Type": "application/json"
    }

});


// ======================================================
// REFRESH PROMISE
// ======================================================
//
// null
//   ↓
// No refresh currently happening.
//
// Promise
//   ↓
// A refresh request is currently happening.
// Other 401 requests will wait for this promise.
//
// ======================================================

let refreshPromise = null;


// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

api.interceptors.request.use((config) => {

    const accessToken = tokenStore.getAccess();


    if (accessToken) {

        config.headers.Authorization =
            `Bearer ${accessToken}`;

    }


    return config;

});


// ======================================================
// REFRESH ACCESS TOKEN
// ======================================================

async function refreshAccessToken() {

    const refreshToken =
        tokenStore.getRefresh();


    if (!refreshToken) {

        throw new Error(
            "No refresh token available"
        );

    }


    // IMPORTANT:
    // Use axios directly instead of api.
    //
    // Otherwise the refresh request itself would
    // also pass through our interceptors.

    const response = await axios.post(

        `${BASE_URL}/auth/refresh`,

        {
            refreshToken
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
    } = response.data;


    // Save BOTH because backend rotates
    // the refresh token.

    tokenStore.setTokens(
        accessToken,
        newRefreshToken
    );


    return accessToken;

}


// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

api.interceptors.response.use(

    // ==============================================
    // SUCCESS
    // ==============================================

    (response) => {

        return response;

    },


    // ==============================================
    // ERROR
    // ==============================================

    async (error) => {

        const originalRequest =
            error.config;


        // ------------------------------------------
        // Only handle 401
        // ------------------------------------------

        if (
            error.response?.status !== 401
        ) {

            return Promise.reject(error);

        }


        // ------------------------------------------
        // Don't retry the same request forever
        // ------------------------------------------

        if (originalRequest._retry) {

            tokenStore.clear();

            return Promise.reject(error);

        }


        originalRequest._retry = true;


        try {

            // --------------------------------------
            // Start refresh if nobody is refreshing
            // --------------------------------------

            if (!refreshPromise) {

                refreshPromise =
                    refreshAccessToken();


                try {

                    await refreshPromise;

                } finally {

                    refreshPromise = null;

                }

            }

            // --------------------------------------
            // Otherwise wait for existing refresh
            // --------------------------------------

            else {

                await refreshPromise;

            }


            // --------------------------------------
            // Get newly stored access token
            // --------------------------------------

            const newAccessToken =
                tokenStore.getAccess();


            // --------------------------------------
            // Update original request
            // --------------------------------------

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;


            // --------------------------------------
            // Retry original request
            // --------------------------------------

            return api(originalRequest);

        }

        catch (refreshError) {

            // Refresh failed.
            //
            // Access + refresh tokens are no longer
            // usable.

            tokenStore.clear();

            return Promise.reject(
                refreshError
            );

        }

    }

);
```

---

## The one concept I want you to remember

Don't think of this as some complicated Axios magic.

Think of:

```js
let refreshPromise = null;
```

as a **"refresh currently happening" flag that contains the actual Promise**.

### No refresh happening:

```text
refreshPromise = null
```

First 401:

```text
refreshPromise = refreshAccessToken()
```

Other 401s:

```text
await refreshPromise
```

Refresh finishes:

```text
refreshPromise = null
```

Then everyone retries with the new token.

That's the entire idea behind the concurrent-refresh queue.
