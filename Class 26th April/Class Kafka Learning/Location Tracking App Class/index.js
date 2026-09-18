import http from "http";
import path from "node:path";
import "dotenv/config";
import express from "express";
import { Server } from "socket.io";
import { kafkaClient } from "./kafka-client.js";

const PORT = process.env.PORT ?? 8080;

async function main() {
    const app = express();

    const server = http.createServer(app);

    const io = new Server();

    const kafkaProducer = kafkaClient.producer();
    await kafkaProducer.connect();

    const kafkaConsumer = kafkaClient.consumer({ groupId: `Socket-server-${PORT}` });
    await kafkaConsumer.connect();

    await kafkaConsumer.subscribe({ topics: ['location-updates'], fromBeginning: true });

    kafkaConsumer.run({
        eachMessage: async ({topic, partition, message, heartbeat}) => {
            const data = JSON.parse(message.value.toString());
            console.log(`Kafka consumer data received: `, { data });

            io.emit("server:location:update", { id: data.id, latitude: data.latitude, longitude: data.longitude });

            await heartbeat();
        }
    });

    io.attach(server);

    io.on("connection", (socket) => {
        console.log(`Socket connected: `, socket.id);

        socket.on("client:location:update", async (data) => {
            console.log(`User location update:- latitude:${data.latitude}, longitude${data.longitude}`);

            await kafkaProducer.send({ topic: "location-updates", messages: [
                {
                    key: socket.id,
                    value: JSON.stringify({ id: socket.id, latitude: data.latitude, longitude: data.longitude })
                }
            ] })
        });
    });

    app.use(express.static(path.resolve('./public')))

    app.get('/health', (req, res) => {
        res.status(200).json({
            status: "UP",
            timestamp: new Date().toISOString()
        });
    });

    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    })
}

main().catch((err) => {
    console.error('Error running the server: ', err);
});