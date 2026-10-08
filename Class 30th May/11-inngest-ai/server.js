import 'dotenv/config';
import express from "express";
import { serve } from "inngest/express";
import { inngest, openrouter } from "./inngest-client.js";
import { onOrderPlaced } from "./01-inngest.js";
import { summarizeThenTranslate } from "./02-step-ai.js"; 

const app = express();
app.use(express.json());

app.use('/api/inngest', serve({
    client: inngest,
    functions: [onOrderPlaced, summarizeThenTranslate],
}));

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
