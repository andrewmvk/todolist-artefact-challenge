"use client";
// ^-- to make sure we can mount the Provider from a server component

// este é Provider que envolve toda a aplicação, provendo acesso ao CRUD de tarefas para os componentes
// o Provider é importado pelo arquivo "layout.tsx" que é o arquivo principal do site para definição do layout geral e repetitivo entre as páginas (como footer e header)
// seguido conforme documentação do TRPC (https://trpc.io/docs/client/tanstack-react-query/server-components#4-create-a-trpc-client-for-client-components)

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { makeQueryClient } from "@/server/query-client";
import type { AppRouter } from "@/server/routers/_app";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;

function getQueryClient() {
	if (typeof window === "undefined") {
		return makeQueryClient();
	}

	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

export function TRPCReactProvider({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const queryClient = getQueryClient();

	// configuração para correto acesso ao TRPC utilizando as rotas padrões definidas pelo Next.js
	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: "http://localhost:3000/api/trpc",
					// acessar http://localhost:3000/api/trpc/todoList?batch=1&input=%7B"0"%3A%7B"limit"%3A15%2C"direction"%3A"forward"%7D%7D retorna a listagem de tarefas
				}),
			],
		})
	);

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{children}
			</TRPCProvider>
		</QueryClientProvider>
	);
}
