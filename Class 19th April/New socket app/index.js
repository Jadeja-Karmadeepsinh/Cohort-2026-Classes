import http from "node:http";
import express from "express";
import path from "node:path";
import { Server } from "socket.io";

async function main() {
    const app = express();
    app.use(express.static(path.resolve('./public')));

    const server = http.createServer(app);

    const io = new Server();
    io.attach(server); 

    io.on('connection', (socket) => {
        console.log("A new socket has connected", socket.id);

        socket.on("user:message", (data) => {
            console.log(`user ${socket.id} socket message: ` ,data);

            socket.broadcast.emit("server:message", data);
        });

        // socket.disconnect(); to disconnect this socket connection from server side. But we don't want to do that here because we want to keep the connection open for future messages.

        socket.on("user:typing", (data) => {
            console.log(`User ${socket.id} is typing: `, data);
            socket.broadcast.emit("server:user:typing", { id: socket.id });
        });

        socket.on("user:stop-typing", () => {
            console.log(`User ${socket.id} has stopped typing`);
            socket.broadcast.emit("server:user:stop-typing", { id: socket.id });
        });

        socket.on("disconnect", () => {
            console.log(`Socket with id ${socket.id} has disconnected`);
        });
    });

    server.listen(9000, () => {
        console.log("Server is running on PORT: 9000");
    })
}

main().catch((err) => {
    console.log(err);
});
