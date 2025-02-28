import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

// código mínimo para criação de um handler provido pela documentação do TRPC (https://trpc.io/docs/client/tanstack-react-query/server-components)

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: createTRPCContext,
	});

export { handler as GET, handler as POST };
