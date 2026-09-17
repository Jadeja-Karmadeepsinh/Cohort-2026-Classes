import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";

export function setupSocketIO(server: HTTPServer) {
    const io = new Server(server);

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
}