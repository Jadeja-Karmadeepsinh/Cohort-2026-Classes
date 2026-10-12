import express, { type Express, type Request, type Response } from "express";
import { createUserSchema } from "@monorepo-practice/utils";
import cors from 'cors';
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "@monorepo-practice/trpc";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

app.use('/trpc', createExpressMiddleware({
  router: appRouter
}))

// Health check route
// app.get("/health", (_req: Request, res: Response) => {
//   res.status(200).json({
//     status: "ok",
//     timestamp: new Date().toISOString(),
//   });
// });

// app.post('/register', async (req:Request, res: Response) => {
//   try {
//     const { username, email, password } = createUserSchema.parse(req.body);
//     console.log(username, email, password);
//     res.status(200).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ message: "Invalid request body" });
//   }
// })

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
