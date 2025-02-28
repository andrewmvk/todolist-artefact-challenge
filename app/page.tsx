import TodoList from "./components/TodoList";
import { getQueryClient, trpc } from "@/server/ssr-caller";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function Home() {
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.todoList.queryOptions({ limit: 15 }));

	return (
		<div>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<TodoList />
			</HydrationBoundary>
		</div>
	);
}
