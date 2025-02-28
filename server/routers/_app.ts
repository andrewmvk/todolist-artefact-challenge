import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

// neste arquivo, encontra-se a implementação de um CRUD de tarefas utilizando o TRPC,
// segue o exemplo mínimo para este arquivo: https://trpc.io/docs/client/tanstack-react-query/server-components

interface Todo {
	id: number;
	titulo: string;
	descricao?: string;
	dataCriacao: Date;
} // Interface descrevendo a tipagem do objeto de uma tarefa

const todos: Todo[] = [];

const defaultTodo: Todo = {
	id: 0,
	titulo: "Tarefa padrão",
	descricao:
		"Essa é uma tarefa de teste, um exemplo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum pellentesque ligula ipsum, vitae mollis massa imperdiet eget. Ut at risus a sem dapibus condimentum sed sit amet nisi.",
	dataCriacao: new Date(),
}; // esta é uma tarefa de exemplo adicionada manualmente (hardcoded) para fins de teste

todos.push(defaultTodo);

const generateUniqueId = (): number => {
	// gera um id aleatório (número inteiro) que, caso não esteja em uso, aloca-o para a nova tarefa
	// é uma forma simples de gerar um id de forma aleatória e baixa probabilidade de colisão (em casos de poucas tarefas)

	let newId: number;
	do {
		newId = Math.floor(Math.random() * 1000);
	} while (todos.find((todo) => todo.id === newId));

	return newId;
};

// este é o procedimento público que será utilizado para realizar as operações de CRUD de tarefas
// ele é exportado para ser utilizado nos arquivos: "ssr-caller.tsx" e no "TrpcProvider.tsx"
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
			const limit = input.limit ?? 15;
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
			if (input.titulo === "") {
				throw new Error("Tarefa não pode ser criada sem um título.");
			}

			const newTodo: Todo = {
				id: generateUniqueId(),
				titulo: input.titulo,
				descricao: input.descricao,
				dataCriacao: new Date(),
			};
			todos.push(newTodo);
			return newTodo;
		}),
	removeTodo: publicProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			const index = todos.findIndex((todo) => todo.id === input.id);
			if (index === -1) {
				throw new Error("Tarefa não encontrada.");
			}

			const removedTodo = todos.splice(index, 1)[0];
			return removedTodo;
		}),
	editTodo: publicProcedure
		.input(
			z.object({
				id: z.number(),
				titulo: z.string(),
				descricao: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const index = todos.findIndex((todo) => todo.id === input.id);
			if (index === -1) {
				throw new Error("Tarefa não encontrada.");
			}

			todos[index].titulo = input.titulo;
			todos[index].descricao = input.descricao;
			return todos[index];
		}),
});

export type AppRouter = typeof appRouter;
