import http from "node:http";
import app from "./src/index.js";
import { env } from "./src/common/config/env.js";
import { setupSocketIO } from "./src/sockets/socket.js";

const PORT = env.PORT ?? 8000;

async function main() {
    const server = http.createServer(app);

    setupSocketIO(server);

    server.listen(PORT, () => {
        console.log(`Server is running on: http://localhost:${PORT}/`);
    });
}

main().catch((err) => {
    console.log("Error starting server: ", err);
    process.exit(1);
})