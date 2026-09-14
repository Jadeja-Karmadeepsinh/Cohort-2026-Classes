import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { connectDB } from "./db/db.js";
import Checkbox from "./db/model.js";

const PORT = process.env.PORT || 9000;

async function main() {
    //! Connect DB
    await connectDB();

    const app = express();
    app.use(express.static(path.resolve("./public")));

    const server = http.createServer(app);
    const io = new Server();

    io.attach(server);

    io.on("connection", async (socket) => {
        console.log("A user connected: ", socket.id);

        // Send existing checkbox state
        // to the newly connected user
        const checkboxStates = await Checkbox.find();

        socket.emit("server:initial-checkbox-state", checkboxStates);

        socket.on("user:change", async (data) => {
            // console.log(data);

            //! Update data in db
            await Checkbox.findOneAndUpdate(
                { id: data.id },
                { checked: data.checked },
                {
                    upsert: true,
                    returnDocument: "after"
                }
            );

            //Broadcast the data to all the connected sockets
            socket.broadcast.emit("server:user:change", data);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected: ", socket.id);
        });
    });

    server.listen(PORT, () => {
        console.log(`Server is running on PORT ${PORT}`);
    });
}

main().catch((err) => {
    console.log("Failed to start server: ", err);
});