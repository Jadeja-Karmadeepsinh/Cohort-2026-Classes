Yep. Let's build **the whole Redis/Valkey layer now**, but keep it understandable rather than dumping unexplained code.

We'll implement:

1. **3 Valkey connections**
2. **User storage**
3. **Email → user ID lookup**
4. **Refresh-token storage**
5. **IP rate limiting for register/login**
6. **User-ID rate limiting for checkbox updates**
7. **Checkbox state**
8. **Pub/Sub for multi-server synchronization**
9. **Socket.IO subscriber → broadcast to connected clients**

We're assuming your current structure is:

```text
1-million-checkboxes/
│
├── public/
│   └── index.html
│
├── src/
│   ├── common/
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── redis.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── userRateLimiter.ts
│   │   │
│   │   └── utils/
│   │       └── jwt.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── user.repository.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   └── checkbox/
│   │       ├── checkbox.repository.ts
│   │       ├── checkbox.service.ts
│   │       ├── checkbox.controller.ts
│   │       └── checkbox.routes.ts
│   │
│   ├── sockets/
│   │   ├── socket.ts
│   │   └── socket.types.ts
│   │
│   └── index.ts
│
├── server.ts
├── .env
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

# 1. `.env`

```env
PORT=8000
NODE_ENV=development

REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

For now these secrets are fine for local development. Don't commit `.env`.

---

# 2. `env.ts`

```ts
// src/common/config/env.ts

import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({

    PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(8000),

    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    REDIS_URL: z
        .string()
        .min(1),

    JWT_ACCESS_SECRET: z
        .string()
        .min(1),

    JWT_REFRESH_SECRET: z
        .string()
        .min(1),

    JWT_ACCESS_EXPIRES_IN: z
        .string()
        .default("15m"),

    JWT_REFRESH_EXPIRES_IN: z
        .string()
        .default("7d"),
});

export const env = envSchema.parse(process.env);
```

---

# 3. Three Valkey connections

This is the important file:

```ts
// src/common/config/redis.ts

import Redis from "ioredis";

import { env } from "./env.js";


function createRedisConnection() {

    return new Redis(env.REDIS_URL);

}


export const redis = createRedisConnection();

export const publisher = createRedisConnection();

export const subscriber = createRedisConnection();
```

So:

```text
redis
   ↓
normal GET / SET / HSET / INCR / etc.

publisher
   ↓
PUBLISH

subscriber
   ↓
SUBSCRIBE
```

---

# 4. Test that Valkey is actually connected

Add this temporarily:

```ts
// src/common/config/redis.ts

import Redis from "ioredis";

import { env } from "./env.js";


function createRedisConnection() {

    return new Redis(env.REDIS_URL);

}


export const redis = createRedisConnection();

export const publisher = createRedisConnection();

export const subscriber = createRedisConnection();


redis.on("connect", () => {
    console.log("Valkey connected");
});

redis.on("error", (error) => {
    console.error("Valkey error:", error);
});
```

Start Valkey:

```powershell
docker compose up -d
```

Then:

```powershell
npm run dev
```

You should see:

```text
Valkey connected
```

---

# 5. User repository

Now we'll store users.

```ts
// src/modules/auth/user.repository.ts

import { redis } from "../../common/config/redis.js";


export interface CreateUserData {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: string;
}


export interface RedisUser {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: string;
}


export async function createUser(data: CreateUserData) {

    await redis.hset(`user:${data.id}`, {
        id: data.id,
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
    });


    await redis.set(
        `user:email:${data.email}`,
        data.id
    );
}


export async function findUserByEmail(
    email: string
): Promise<RedisUser | null> {

    const userId = await redis.get(
        `user:email:${email}`
    );


    if (!userId) {
        return null;
    }


    return findUserById(userId);
}


export async function findUserById(
    userId: string
): Promise<RedisUser | null> {

    const user = await redis.hgetall(
        `user:${userId}`
    );


    if (!user.id) {
        return null;
    }


    return user as RedisUser;
}
```

---

# 6. What this creates in Valkey

After registering:

```text
user:550e8400-e29b-41d4-a716-446655440000

id             → 550e8400-e29b-41d4-a716-446655440000
name           → Karmadeep
email          → test@gmail.com
passwordHash   → $2b$12$....
role           → user
```

And:

```text
user:email:test@gmail.com
        ↓
550e8400-e29b-41d4-a716-446655440000
```

The second key exists because Redis doesn't automatically do:

```js
findOne({ email })
```

like MongoDB.

---

# 7. Refresh-token repository

Let's keep refresh tokens separate from user data.

```ts
// src/modules/auth/refreshToken.repository.ts

import { redis } from "../../common/config/redis.js";


const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;


export async function saveRefreshToken(
    userId: string,
    hashedRefreshToken: string
) {

    await redis.set(
        `refresh:${userId}`,
        hashedRefreshToken,
        "EX",
        REFRESH_TOKEN_TTL
    );

}


export async function getRefreshToken(
    userId: string
) {

    return redis.get(
        `refresh:${userId}`
    );

}


export async function deleteRefreshToken(
    userId: string
) {

    await redis.del(
        `refresh:${userId}`
    );

}
```

Now:

```text
refresh:USER_ID
      ↓
hashed refresh token

TTL → 7 days
```

---

# 8. JWT utility

Since we're using UUIDs, **`userId` is a string**.

```ts
// src/common/utils/jwt.ts

import jwt from "jsonwebtoken";

import { env } from "../config/env.js";


export interface TokenPayload extends jwt.JwtPayload {

    userId: string;

    type: "access" | "refresh";

}


export function generateAccessToken(
    userId: string
): string {

    return jwt.sign(
        {
            userId,
            type: "access",
        },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
        }
    );

}


export function generateRefreshToken(
    userId: string
): string {

    return jwt.sign(
        {
            userId,
            type: "refresh",
        },
        env.JWT_REFRESH_SECRET,
        {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
        }
    );

}


export function verifyAccessToken(
    token: string
): TokenPayload {

    const decoded = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET
    ) as TokenPayload;


    if (decoded.type !== "access") {

        throw new Error("Invalid token type");

    }


    return decoded;

}


export function verifyRefreshToken(
    token: string
): TokenPayload {

    const decoded = jwt.verify(
        token,
        env.JWT_REFRESH_SECRET
    ) as TokenPayload;


    if (decoded.type !== "refresh") {

        throw new Error("Invalid token type");

    }


    return decoded;

}
```

---

# 9. Password hashing

We're already using bcrypt.

During registration:

```ts
const passwordHash = await bcrypt.hash(password, 12);
```

We **never store**:

```text
password → "mypassword123"
```

We store:

```text
passwordHash → "$2b$12$..."
```

---

# 10. Generate user ID

During registration:

```ts
import crypto from "node:crypto";

const userId = crypto.randomUUID();
```

Example:

```text
550e8400-e29b-41d4-a716-446655440000
```

Type:

```ts
string
```

---

# 11. Auth service

Now combine everything.

```ts
// src/modules/auth/auth.service.ts

import crypto from "node:crypto";

import bcrypt from "bcrypt";

import {
    createUser,
    findUserByEmail,
} from "./user.repository.js";

import {
    saveRefreshToken,
} from "./refreshToken.repository.js";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../../common/utils/jwt.js";


export async function registerUser(
    name: string,
    email: string,
    password: string
) {

    const normalizedEmail = email
        .trim()
        .toLowerCase();


    const existingUser = await findUserByEmail(
        normalizedEmail
    );


    if (existingUser) {

        throw new Error("User already exists");

    }


    const passwordHash = await bcrypt.hash(
        password,
        12
    );


    const userId = crypto.randomUUID();


    await createUser({
        id: userId,
        name,
        email: normalizedEmail,
        passwordHash,
        role: "user",
    });


    const accessToken = generateAccessToken(
        userId
    );


    const refreshToken = generateRefreshToken(
        userId
    );


    const hashedRefreshToken = await bcrypt.hash(
        refreshToken,
        12
    );


    await saveRefreshToken(
        userId,
        hashedRefreshToken
    );


    return {
        user: {
            id: userId,
            name,
            email: normalizedEmail,
            role: "user",
        },

        accessToken,

        refreshToken,
    };

}
```

---

# 12. Login

Add this to the same service:

```ts
export async function loginUser(
    email: string,
    password: string
) {

    const normalizedEmail = email
        .trim()
        .toLowerCase();


    const user = await findUserByEmail(
        normalizedEmail
    );


    if (!user) {

        throw new Error(
            "Invalid email or password"
        );

    }


    const passwordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );


    if (!passwordValid) {

        throw new Error(
            "Invalid email or password"
        );

    }


    const accessToken = generateAccessToken(
        user.id
    );


    const refreshToken = generateRefreshToken(
        user.id
    );


    const hashedRefreshToken = await bcrypt.hash(
        refreshToken,
        12
    );


    await saveRefreshToken(
        user.id,
        hashedRefreshToken
    );


    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },

        accessToken,

        refreshToken,
    };

}
```

---

# 13. IP rate limiter

Now we'll protect registration/login.

```ts
// src/common/middleware/rateLimiter.ts

import type {
    Request,
    Response,
    NextFunction
} from "express";

import { redis } from "../config/redis.js";


interface RateLimiterOptions {

    maxRequests: number;

    windowSeconds: number;

    keyPrefix: string;

}


export function rateLimiter(
    options: RateLimiterOptions
) {

    return async function (
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const ip = req.ip ?? "unknown";


            const key =
                `${options.keyPrefix}:${ip}`;


            const count = await redis.incr(key);


            if (count === 1) {

                await redis.expire(
                    key,
                    options.windowSeconds
                );

            }


            if (count > options.maxRequests) {

                return res.status(429).json({

                    success: false,

                    message:
                        "Too many requests. Try again later."

                });

            }


            next();

        } catch (error) {

            console.error(
                "Rate limiter error:",
                error
            );


            return res.status(500).json({

                success: false,

                message: "Internal server error"

            });

        }

    };

}
```

Now we can reuse it.

---

# 14. HTTP authentication middleware

First, our Express request needs `user`.

Create:

```ts
// src/common/types/express.d.ts

declare global {

    namespace Express {

        interface Request {

            user?: {

                userId: string;

            };

        }

    }

}

export {};
```

Then:

```ts
// src/common/middleware/auth.ts

import type {
    Request,
    Response,
    NextFunction
} from "express";

import {
    verifyAccessToken
} from "../utils/jwt.js";


export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {

    try {

        const token =
            req.cookies.accessToken;


        if (!token) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        const decoded =
            verifyAccessToken(token);


        req.user = {

            userId: decoded.userId

        };


        next();

    } catch {

        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired access token"

        });

    }

}
```

---

# 15. User-ID rate limiter

Now we can finally do what you originally suggested.

```ts
// src/common/middleware/userRateLimiter.ts

import type {
    Request,
    Response,
    NextFunction
} from "express";

import { redis } from "../config/redis.js";


interface UserRateLimiterOptions {

    maxRequests: number;

    windowSeconds: number;

}


export function userRateLimiter(
    options: UserRateLimiterOptions
) {

    return async function (
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const userId =
                req.user?.userId;


            if (!userId) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Authentication required"

                });

            }


            const key =
                `rate-limit:user:${userId}`;


            const count =
                await redis.incr(key);


            if (count === 1) {

                await redis.expire(
                    key,
                    options.windowSeconds
                );

            }


            if (
                count >
                options.maxRequests
            ) {

                return res.status(429).json({

                    success: false,

                    message:
                        "Too many requests. Try again later."

                });

            }


            next();

        } catch (error) {

            console.error(
                "User rate limiter error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Internal server error"

            });

        }

    };

}
```

---

# 16. Auth routes

Now:

```ts
// src/modules/auth/auth.routes.ts

import { Router } from "express";

import {
    rateLimiter
} from "../../common/middleware/rateLimiter.js";


const router = Router();


const authRateLimiter = rateLimiter({

    maxRequests: 5,

    windowSeconds: 60,

    keyPrefix: "rate-limit:auth"

});


router.post(
    "/register",
    authRateLimiter,
    registerController
);


router.post(
    "/login",
    authRateLimiter,
    loginController
);


export default router;
```

We'll connect the controllers once we finish the Redis foundation.

---

# 17. Checkbox state

Now the actual million checkboxes.

We need to decide what a checkbox looks like.

For the simplest implementation:

```text
checkbox ID → state
```

For example:

```text
checkbox:0 → 1
checkbox:1 → 0
checkbox:2 → 1
```

Where:

```text
1 = checked
0 = unchecked
```

But creating **1 million individual Redis keys** is unnecessary.

Instead, use a Redis **Hash**:

```text
checkboxes
│
├── 0 → 1
├── 1 → 0
├── 2 → 1
├── 3 → 0
└── ...
```

So we can have:

```text
checkboxes
```

as one Redis hash.

---

# 18. Checkbox repository

```ts
// src/modules/checkbox/checkbox.repository.ts

import { redis } from "../../common/config/redis.js";


const CHECKBOX_KEY = "checkboxes";


export async function getCheckbox(
    checkboxId: string
) {

    return redis.hget(
        CHECKBOX_KEY,
        checkboxId
    );

}


export async function setCheckbox(
    checkboxId: string,
    checked: boolean
) {

    await redis.hset(
        CHECKBOX_KEY,
        checkboxId,
        checked ? "1" : "0"
    );

}


export async function getAllCheckboxes() {

    return redis.hgetall(
        CHECKBOX_KEY
    );

}
```

---

# 19. Example

If:

```ts
await setCheckbox("123", true);
```

Valkey becomes:

```text
checkboxes

123 → 1
```

Then:

```ts
await setCheckbox("123", false);
```

becomes:

```text
checkboxes

123 → 0
```

---

# 20. Checkbox validation

We shouldn't allow:

```text
checkboxId = "hello"
checkboxId = "-999"
checkboxId = "999999999999999999"
```

Create a schema:

```ts
// src/modules/checkbox/checkbox.schema.ts

import { z } from "zod";


export const checkboxUpdateSchema = z.object({

    checkboxId: z.coerce
        .number()
        .int()
        .min(0)
        .max(999999),

    checked: z.boolean(),

});


export type CheckboxUpdateInput =
    z.infer<typeof checkboxUpdateSchema>;
```

Now our IDs are:

```text
0 → 999999
```

That's exactly one million checkboxes.

---

# 21. Checkbox service

```ts
// src/modules/checkbox/checkbox.service.ts

import {
    setCheckbox
} from "./checkbox.repository.js";

import {
    publisher
} from "../../common/config/redis.js";


export interface CheckboxUpdate {

    checkboxId: number;

    checked: boolean;

    userId: string;

}


export async function updateCheckbox(
    data: CheckboxUpdate
) {

    await setCheckbox(
        String(data.checkboxId),
        data.checked
    );


    await publisher.publish(

        "checkbox-updates",

        JSON.stringify({

            checkboxId: data.checkboxId,

            checked: data.checked,

            userId: data.userId,

        })

    );

}
```

This is where Pub/Sub enters.

---

# 22. What happens when a user checks checkbox 123?

Suppose:

```text
User ID = ABC
Checkbox = 123
Checked = true
```

Request comes in:

```text
Browser
   ↓
JWT authentication
   ↓
userId = ABC
   ↓
rate limiter
   ↓
checkbox service
```

Service does:

```text
Valkey:

checkboxes
   ↓
123 → 1
```

Then:

```text
PUBLISH checkbox-updates
{
    checkboxId: 123,
    checked: true,
    userId: "ABC"
}
```

---

# 23. Why Pub/Sub?

Imagine:

```text
              Valkey
                 │
          checkbox-updates
                 │
       ┌─────────┴─────────┐
       │                   │
    Server 1            Server 2
       │                   │
       ▼                   ▼
   Socket users        Socket users
```

User A connects to Server 1.

User B connects to Server 2.

User A checks checkbox 123.

Server 1 updates Valkey and publishes:

```text
checkbox 123 = true
```

Server 2 receives the message.

Then Server 2 broadcasts it to its connected users.

That's the whole reason for Pub/Sub.

---

# 24. Socket types

Now let's type our Socket.IO data.

```ts
// src/sockets/socket.types.ts

import type { Socket } from "socket.io";


export interface SocketData {

    userId: string;

}


export interface ClientToServerEvents {

    "checkbox:update": (data: {

        checkboxId: number;

        checked: boolean;

    }) => void;

}


export interface ServerToClientEvents {

    "checkbox:updated": (data: {

        checkboxId: number;

        checked: boolean;

    }) => void;

}


export type AuthenticatedSocket =
    Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        {},
        SocketData
    >;
```

This lets TypeScript understand:

```ts
socket.data.userId
```

and:

```ts
socket.on("checkbox:update", ...)
```

---

# 25. Socket.IO authentication + Pub/Sub

Now the big file:

```ts
// src/sockets/socket.ts

import { Server } from "socket.io";

import type {
    Server as HTTPServer
} from "node:http";


import {
    verifyAccessToken
} from "../common/utils/jwt.js";


import {
    publisher,
    subscriber
} from "../common/config/redis.js";


import {
    setCheckbox
} from "../modules/checkbox/checkbox.repository.js";


import type {
    ClientToServerEvents,
    ServerToClientEvents,
    SocketData
} from "./socket.types.js";


export function setupSocketIO(
    server: HTTPServer
) {

    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        {},
        SocketData
    >(server);


    /*
    |--------------------------------------------------------------------------
    | SOCKET AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    io.use((socket, next) => {

        try {

            const token =
                socket.handshake.auth.token;


            if (!token) {

                return next(
                    new Error(
                        "Authentication required"
                    )
                );

            }


            const decoded =
                verifyAccessToken(token);


            socket.data.userId =
                decoded.userId;


            next();

        } catch {

            next(
                new Error(
                    "Invalid or expired access token"
                )
            );

        }

    });


    /*
    |--------------------------------------------------------------------------
    | REDIS SUBSCRIBER
    |--------------------------------------------------------------------------
    */

    subscriber.subscribe(
        "checkbox-updates"
    );


    subscriber.on(
        "message",
        (
            channel,
            message
        ) => {

            if (
                channel !==
                "checkbox-updates"
            ) {
                return;
            }


            const data =
                JSON.parse(message);


            io.emit(
                "checkbox:updated",
                {
                    checkboxId:
                        data.checkboxId,

                    checked:
                        data.checked,
                }
            );

        }
    );


    /*
    |--------------------------------------------------------------------------
    | SOCKET CONNECTION
    |--------------------------------------------------------------------------
    */

    io.on("connection", (socket) => {

        console.log(
            `User connected: ${socket.id}`
        );


        console.log(
            `User ID: ${socket.data.userId}`
        );


        /*
        |--------------------------------------------------------------------------
        | CHECKBOX UPDATE
        |--------------------------------------------------------------------------
        */

        socket.on(
            "checkbox:update",
            async (data) => {

                try {

                    const userId =
                        socket.data.userId;


                    /*
                    |--------------------------------------------------------------------------
                    | SOCKET RATE LIMIT
                    |--------------------------------------------------------------------------
                    */

                    const key =
                        `rate-limit:socket:${userId}`;


                    const count =
                        await io.redis.incr(key);


                } catch (error) {

                    console.error(
                        "Socket error:",
                        error
                    );

                }

            }
        );


        /*
        |--------------------------------------------------------------------------
        | DISCONNECT
        |--------------------------------------------------------------------------
        */

        socket.on(
            "disconnect",
            () => {

                console.log(
                    `User disconnected: ${socket.id}`
                );

            }
        );

    });


    return io;

}
```

**STOP HERE for one correction:** `io.redis` does not exist. We need to use our imported `redis`.

So the actual socket file should use:

```ts
import {
    redis,
    publisher,
    subscriber
} from "../common/config/redis.js";
```

And:

```ts
const count =
    await redis.incr(key);
```

---

# 26. Complete corrected `socket.ts`

Use this version:

```ts
// src/sockets/socket.ts

import { Server } from "socket.io";

import type {
    Server as HTTPServer
} from "node:http";


import {
    verifyAccessToken
} from "../common/utils/jwt.js";


import {
    redis,
    publisher,
    subscriber
} from "../common/config/redis.js";


import {
    setCheckbox
} from "../modules/checkbox/checkbox.repository.js";


import type {
    ClientToServerEvents,
    ServerToClientEvents,
    SocketData
} from "./socket.types.js";


export function setupSocketIO(
    server: HTTPServer
) {

    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        {},
        SocketData
    >(server);


    /*
    |--------------------------------------------------------------------------
    | SOCKET AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    io.use((socket, next) => {

        try {

            const token =
                socket.handshake.auth.token;


            if (!token) {

                return next(
                    new Error(
                        "Authentication required"
                    )
                );

            }


            const decoded =
                verifyAccessToken(token);


            socket.data.userId =
                decoded.userId;


            next();

        } catch {

            next(
                new Error(
                    "Invalid or expired access token"
                )
            );

        }

    });


    /*
    |--------------------------------------------------------------------------
    | REDIS SUBSCRIBER
    |--------------------------------------------------------------------------
    */

    subscriber.subscribe(
        "checkbox-updates"
    );


    subscriber.on(
        "message",
        (
            channel,
            message
        ) => {

            if (
                channel !==
                "checkbox-updates"
            ) {

                return;

            }


            try {

                const data =
                    JSON.parse(message);


                io.emit(
                    "checkbox:updated",
                    {
                        checkboxId:
                            data.checkboxId,

                        checked:
                            data.checked,
                    }
                );

            } catch (error) {

                console.error(
                    "Invalid Pub/Sub message:",
                    error
                );

            }

        }
    );


    /*
    |--------------------------------------------------------------------------
    | SOCKET CONNECTION
    |--------------------------------------------------------------------------
    */

    io.on("connection", (socket) => {

        console.log(
            `User connected: ${socket.id}`
        );


        console.log(
            `User ID: ${socket.data.userId}`
        );


        /*
        |--------------------------------------------------------------------------
        | CHECKBOX UPDATE
        |--------------------------------------------------------------------------
        */

        socket.on(
            "checkbox:update",
            async (data) => {

                try {

                    const userId =
                        socket.data.userId;


                    /*
                    |--------------------------------------------------------------------------
                    | RATE LIMIT
                    |--------------------------------------------------------------------------
                    */

                    const key =
                        `rate-limit:socket:${userId}`;


                    const count =
                        await redis.incr(key);


                    if (count === 1) {

                        await redis.expire(
                            key,
                            60
                        );

                    }


                    if (count > 60) {

                        socket.emit(
                            "error",
                            {
                                message:
                                    "Too many checkbox updates"
                            }
                        );

                        return;

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | SAVE CHECKBOX
                    |--------------------------------------------------------------------------
                    */

                    await setCheckbox(
                        String(data.checkboxId),
                        data.checked
                    );


                    /*
                    |--------------------------------------------------------------------------
                    | BROADCAST TO OTHER SERVERS
                    |--------------------------------------------------------------------------
                    */

                    await publisher.publish(

                        "checkbox-updates",

                        JSON.stringify({

                            checkboxId:
                                data.checkboxId,

                            checked:
                                data.checked,

                            userId,

                        })

                    );

                } catch (error) {

                    console.error(
                        "Checkbox socket error:",
                        error
                    );

                }

            }
        );


        /*
        |--------------------------------------------------------------------------
        | DISCONNECT
        |--------------------------------------------------------------------------
        */

        socket.on(
            "disconnect",
            () => {

                console.log(
                    `User disconnected: ${socket.id}`
                );

            }
        );

    });


    return io;

}
```

---

# 27. One issue: Socket.IO `error` event typing

Because we're using strict Socket.IO event typing, the custom server events don't currently include `"error"`.

We can add it:

```ts
export interface ServerToClientEvents {

    "checkbox:updated": (data: {

        checkboxId: number;

        checked: boolean;

    }) => void;


    "error": (data: {

        message: string;

    }) => void;

}
```

Then:

```ts
socket.emit("error", {
    message: "Too many checkbox updates"
});
```

is understood by TypeScript.

---

# 28. Root `server.ts`

Your root server stays very simple:

```ts
// server.ts

import http from "node:http";

import app from "./src/index.js";

import {
    setupSocketIO
} from "./src/sockets/socket.js";

import { env } from "./src/common/config/env.js";


const server =
    http.createServer(app);


setupSocketIO(server);


server.listen(
    env.PORT,
    () => {

        console.log(
            `Server is running on http://localhost:${env.PORT}`
        );

    }
);
```

---

# 29. `src/index.ts`

For your current architecture:

```ts
// src/index.ts

import path from "node:path";

import "dotenv/config";

import express from "express";

import cookieParser from "cookie-parser";


const ROOT_DIR =
    process.cwd();


const app =
    express();


app.use(
    express.json()
);


app.use(
    cookieParser()
);


/*
|--------------------------------------------------------------------------
| STATIC FRONTEND
|--------------------------------------------------------------------------
*/

app.use(
    express.static(
        path.join(
            ROOT_DIR,
            "public"
        )
    )
);


/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get(
    "/health",
    (_req, res) => {

        res.status(200).json({

            status: "UP",

            timestamp:
                new Date().toISOString()

        });

    }
);


/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

// app.use("/api/auth", authRoutes);
// app.use("/api/checkboxes", checkboxRoutes);


/*
|--------------------------------------------------------------------------
| API 404
|--------------------------------------------------------------------------
*/

app.use(
    "/api",
    (_req, res) => {

        return res.status(404).json({

            success: false,

            message:
                "API route not found"

        });

    }
);


/*
|--------------------------------------------------------------------------
| FRONTEND FALLBACK
|--------------------------------------------------------------------------
*/

app.use(
    (_req, res) => {

        return res.sendFile(
            path.join(
                ROOT_DIR,
                "public",
                "index.html"
            )
        );

    }
);


export default app;
```

---

# 30. The final Redis architecture

At this point your Valkey instance conceptually looks like:

```text
VALKEY
│
├── USER DATA
│
│   ├── user:<UUID>
│   │      ├── id
│   │      ├── name
│   │      ├── email
│   │      ├── passwordHash
│   │      └── role
│   │
│   └── user:email:<email>
│          ↓
│          UUID
│
│
├── REFRESH TOKENS
│
│   └── refresh:<UUID>
│          ↓
│          hashed refresh token
│
│
├── RATE LIMITING
│
│   ├── rate-limit:auth:<IP>
│   │
│   ├── rate-limit:user:<UUID>
│   │
│   └── rate-limit:socket:<UUID>
│
│
├── CHECKBOX STATE
│
│   └── checkboxes
│          ├── 0 → 1
│          ├── 1 → 0
│          ├── 2 → 1
│          └── ...
│
│
└── PUB/SUB
       │
       └── checkbox-updates
```

And the three connections:

```text
redis
│
├── Users
├── Refresh tokens
├── Rate limits
├── Checkbox state
└── Other normal commands


publisher
│
└── PUBLISH checkbox-updates


subscriber
│
└── SUBSCRIBE checkbox-updates
```

---

## One thing I would change before we call this "finished"

The code above demonstrates the complete architecture, but **I would not yet call the rate limiter production-grade**. The `INCR` + `EXPIRE` approach is good for learning and is fine as a basic fixed-window limiter, but for this assignment we should eventually make the Redis operation **atomic** with a Lua script and add proper `Retry-After` behavior.

Also, for the checkbox state, we're going to have **1 million entries in one Redis hash**, which is a reasonable starting design, but we should benchmark/make the storage strategy deliberate before finalizing it.

Most importantly, though, you've now got the correct mental model:

```text
                  ┌───────────────┐
                  │    Valkey     │
                  └───────┬───────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
      redis           publisher         subscriber
        │                 │                 │
        ▼                 ▼                 ▼
  Data + limits       PUBLISH          SUBSCRIBE
        │                 │                 │
        │                 └──────┬──────────┘
        │                        │
        ▼                        ▼
 Users / tokens /          Other server
 checkboxes / limits       instances
```

And **yes, the socket connection itself is authenticated before `connection` fires**. So an unauthenticated client doesn't get a usable Socket.IO connection in our application.
