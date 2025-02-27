import "server-only"; // <-- ensure this file cannot be imported from the client

import { cache } from "react";
import { createTRPCContext } from "./trpc";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
	ctx: createTRPCContext,
	router: appRouter,
	queryClient: getQueryClient,
});
