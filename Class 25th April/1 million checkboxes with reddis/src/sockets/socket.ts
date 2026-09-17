import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import { CheckBoxRepository } from "../modules/checkbox/checkbox.repository.js";
import { subscriber } from "../common/config/redis.js";

const CHECKBOX_CHANNEL = "checkbox:change";

export function setupSocketIO(server: HTTPServer) {
    const io = new Server(server);

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
            // console.log(`ID: ${data.id} CHECKED: ${data.checked}`);

            //! here before we emit the data we need to store it in redis also
            await CheckBoxRepository.setCheckbox(data.id, data.checked);

            // io.emit("server:checkbox:change", data);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
}