import {
	defaultShouldDehydrateQuery,
	QueryClient,
} from "@tanstack/react-query";

// código mínimo provido pela documentação do TRPC (https://trpc.io/docs/client/tanstack-react-query/server-components#3-create-a-query-client-factory)

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30 * 1000, // evita refetch de imediato de dados no cliente assim que o servidor responder
			},
			dehydrate: {
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
		},
	});
}
