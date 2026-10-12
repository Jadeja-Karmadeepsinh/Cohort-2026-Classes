import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const router = t.router; // router -> to declare the functions of route
export const publicProcedure = t.procedure; // functions