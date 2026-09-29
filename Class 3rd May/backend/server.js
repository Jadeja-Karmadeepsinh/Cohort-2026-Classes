import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/user.js";
import { connectDB } from "./db.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "ok" }));

app.use((req, res, next) => {
  console.log(`REQ: ${req.method} ${req.originalUrl}`);
  next();
})

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log("DB Connecting.....");

  await connectDB();

  console.log("DB Connected......");

  console.log(`Backend listening on http://localhost:${PORT}`);
});
