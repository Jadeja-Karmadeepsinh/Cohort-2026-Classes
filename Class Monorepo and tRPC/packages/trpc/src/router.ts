import { publicProcedure, router } from "./trpc.js";

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { success: true, timestamp: new Date() };
  }),
});

export type AppRouter = typeof appRouter;