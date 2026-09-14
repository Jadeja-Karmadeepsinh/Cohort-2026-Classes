import http from "http";
import { Server } from "socket.io";
import { connectDB } from "../db/db.js";
import Checkbox from "../db/model.js";

const server = http.createServer();

const io = new Server(server);

let dbConnection = null;

io.on("connection", async (socket) => {
    console.log("A user connected:", socket.id);

    try {
        // Connect to MongoDB
        if (!dbConnection) {
            dbConnection = connectDB();
        }

        await dbConnection;

        // Get existing checkbox states
        const checkboxStates = await Checkbox.find();

        socket.emit(
            "server:initial-checkbox-state",
            checkboxStates
        );

        socket.on("user:change", async (data) => {
            try {
                await Checkbox.findOneAndUpdate(
                    { id: data.id },
                    { checked: data.checked },
                    {
                        upsert: true,
                        returnDocument: "after"
                    }
                );

                // Send change to other connected users
                socket.broadcast.emit(
                    "server:user:change",
                    data
                );

            } catch (error) {
                console.error(
                    "Failed to update checkbox:",
                    error
                );
            }
        });

        socket.on("disconnect", () => {
            console.log(
                "A user disconnected:",
                socket.id
            );
        });

    } catch (error) {
        console.error(
            "Socket connection error:",
            error
        );
    }
});

export default server;