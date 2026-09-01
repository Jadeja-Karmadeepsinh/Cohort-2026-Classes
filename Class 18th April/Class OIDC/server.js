import app from "./src/app.js";
import { connectDB } from "./src/common/config/db.js";
import { env } from "./src/common/config/env.js";

const start = async () => {
    //! connect to db
    await connectDB();

    //! first parse the env then listen on port
    app.listen(env.PORT, () => {
        console.log(`Server is running at ${env.PORT} in ${env.NODE_ENV} mode`);
    })
}

start().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});