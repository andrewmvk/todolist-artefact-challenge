import "server-only"; // <-- ensure this file cannot be imported from the client

// este arquivo serve para prover acesso ao prefetch, ele é um proxy do nosso router TRPC (utilizado em "page.tsx")
// código mínimo provido pela documentação do TRPC (https://trpc.io/docs/client/tanstack-react-query/server-components#5-create-a-trpc-caller-for-server-components) para servidores internos

import { cache } from "react";
import { createTRPCContext } from "./trpc";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

// constante estável para que query do cliente gere sempre o mesmo resultado quando a mesma requisição é feita
export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
	ctx: createTRPCContext,
	router: appRouter,
	queryClient: getQueryClient,
});
