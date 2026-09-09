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

    server.listen(9000, () => {
        console.log("Server is running on PORT: 9000");
    })
}

main().catch((err) => {
    console.log(err);
});
