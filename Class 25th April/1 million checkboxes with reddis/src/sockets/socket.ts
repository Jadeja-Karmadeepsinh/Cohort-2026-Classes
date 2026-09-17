import { Server } from "socket.io";
import * as cookie from "cookie";
import type { Server as HTTPServer } from "node:http";
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from "./socket.types.js";
import { CheckBoxRepository } from "../modules/checkbox/checkbox.repository.js";
import { subscriber } from "../common/config/redis.js";
import { ApiError } from "../common/utils/api-error.js";
import { verifyAccessToken } from "../common/utils/jwt-utils.js";
import { checkSocketRateLimit } from "./socket.rateLimiter.js";

const CHECKBOX_CHANNEL = "checkbox:change";

export function setupSocketIO(server: HTTPServer) {
    // const io = new Server(server);
    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        {},
        SocketData
    >(server);

    //! Authentication with socket middleware
    io.use((socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;

            if(!cookieHeader) {
                return next(ApiError.unauthorized("Authentication required"));
            }

            const cookies = cookie.parse(cookieHeader);

            const accessToken = cookies.accessToken;

            if(!accessToken) {
                return next(ApiError.unauthorized("Authentication required"));
            }

            const decoded = verifyAccessToken(accessToken);

            socket.data.userId = decoded.userId;

            next();
        } catch (error) {
            next(ApiError.unauthorized("Invalid or expired access token"));
        }
    });

    // Subscribe this server to Redis Pub/Sub
    subscriber.subscribe(CHECKBOX_CHANNEL);

    // When Redis sends a message to this server
    subscriber.on("message", (channel, message) => {
        if(channel !== CHECKBOX_CHANNEL) {
            return;
        }

        const data = JSON.parse(message);

        console.log("Redis Pub/Sub message:", data);

        // Send the event to every Socket.IO
        // client connected to THIS server
        io.emit("server:checkbox:change", data);
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("client:checkbox:change", async (data) => {
            try {
                //! check if user is allowed to update 
                const userId = socket.data.userId;
                const allowed = await checkSocketRateLimit(userId);

                if(!allowed) {
                    socket.emit("error", {
                        message: "Too many checkbox updates. Try again later."
                    });

                    return;
                } 

                // console.log(`ID: ${data.id} CHECKED: ${data.checked}`);

                //! here before we emit the data we need to store it in redis also
                await CheckBoxRepository.setCheckbox(data.id, data.checked);

                // io.emit("server:checkbox:change", data);
            } catch (error) {
                console.error("Checkbox update error:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
}