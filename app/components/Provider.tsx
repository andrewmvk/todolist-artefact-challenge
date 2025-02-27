"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { TRPCProvider } from "@/utils/trpc";
import { AppRouter } from "@/server/routers/_app";

export default function Provider({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const [queryClient] = useState(() => new QueryClient({}));
	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: "http://localhost:3000/api/trpc",
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
