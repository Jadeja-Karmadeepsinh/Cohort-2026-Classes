import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@monorepo-practice/trpc";

export const trpc = createTRPCReact<AppRouter>();