"use client";

import { useTRPC } from "@/utils/trpc"; // client trpc
import { useMutation, useQuery } from "@tanstack/react-query";

export default function TodoList() {
	const trpc = useTRPC();
	const todos = useQuery(trpc.todoList.queryOptions());
	const addTodo = useMutation(
		trpc.addTodo.mutationOptions({ onSettled: () => todos.refetch() })
	);

	return (
		<div>
			<div>{JSON.stringify(todos.data)}</div>

			<button onClick={() => addTodo.mutate({ titulo: "Frodo" })}>
				Create Frodo
			</button>
		</div>
	);
}
