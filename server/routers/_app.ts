import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

interface Todo {
	id: number;
	titulo: string;
	descricao?: string;
	dataCriacao: Date;
}

const todos: Todo[] = [];

const defaultTodo: Todo = {
	id: 0,
	titulo: "Tarefa padrão",
	descricao:
		"Essa é uma tarefa de teste, um exemplo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum pellentesque ligula ipsum, vitae mollis massa imperdiet eget. Ut at risus a sem dapibus condimentum sed sit amet nisi.",
	dataCriacao: new Date(),
};

todos.push(defaultTodo);

const generateUniqueId = (): number => {
	// gera um id aleatório (número inteiro) que, caso não esteja em uso, aloca-o para a nova tarefa

	let newId: number;
	do {
		newId = Math.floor(Math.random() * 1000);
	} while (todos.find((todo) => todo.id === newId));

	return newId;
};

export const appRouter = createTRPCRouter({
	todoList: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(30).nullish(),
				cursor: z.number().nullish(),
			})
		)
		.query(async (opts) => {
			const { input } = opts;
			const limit = input.limit ?? 30;
			const { cursor } = input;
			const pageStart = cursor ?? 0;

			const paginatedTodos = todos.slice(pageStart, pageStart + limit);

			let nextCursor: typeof cursor | undefined = undefined;
			if (todos.length > pageStart + limit) {
				nextCursor = pageStart + limit;
			}

			return { paginatedTodos, nextCursor };
		}),
	addTodo: publicProcedure
		.input(
			z.object({ titulo: z.string(), descricao: z.string().optional() })
		)
		.mutation(async ({ input }) => {
			const newTodo: Todo = {
				id: generateUniqueId(),
				titulo: input.titulo,
				descricao: input.descricao,
				dataCriacao: new Date(),
			};
			todos.push(newTodo);
			return newTodo;
		}),
});

export type AppRouter = typeof appRouter;
