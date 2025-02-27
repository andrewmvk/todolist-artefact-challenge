"use client";

import { useTRPC } from "@/utils/providers/TrpcProvider";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function TodoList() {
	const trpc = useTRPC();
	const todos = useQuery(trpc.todoList.queryOptions());
	const addTodo = useMutation(
		trpc.addTodo.mutationOptions({ onSettled: () => todos.refetch() })
	);

	const generateTodoList = () => {
		for (let i = 0; i < 50; i++) {
			addTodo.mutate({
				titulo: `Tarefa ${i}`,
				descricao: `Descrição da tarefa ${i}`,
			});
		}
	};

	return (
		<>
			<div className="todo-list">
				{!todos.data ? <h2>Loading...</h2> : null}
				{todos.data?.map((todo) => {
					const todoDate = new Intl.DateTimeFormat("pt-BR", {
						dateStyle: "short",
					}).format();

					return (
						<div key={todo.id} className="todo-container">
							<h1 className="todo-title">{todo.titulo}</h1>
							<p className="todo-description">{todo.descricao}</p>
							<div className="todo-date-id">
								Criado em: {todoDate} - ID: {todo.id}
							</div>
						</div>
					);
				})}
			</div>

			<div className="side-bar">
				<div className="side-bar-inner">
					<h1>Criar nova tarefa</h1>
					<form
						className="create-form"
						onSubmit={(e) => {
							e.preventDefault();
							const formData = new FormData(
								e.target as HTMLFormElement
							);
							const titulo = formData.get("titulo") as string;
							const descricao = formData.get(
								"descricao"
							) as string;
							addTodo.mutate({ titulo, descricao });
						}}
					>
						<label>
							<input
								placeholder="Título"
								name="titulo"
								className="title-input"
								required
							/>
							<span className="required-icon">*</span>
						</label>
						<input
							placeholder="Descrição"
							name="descricao"
							className="description-input"
						/>
						<button type="submit" className="create-todo-button">
							Criar
						</button>
					</form>

					<div className="add-randoms-container">
						<h1>Criar tarefas aleatórias</h1>
						<p className="todo-description">
							Clique no botão abaixo para criar 50 tarefas
							aleatórias para visualizar a listagem dinâmica
							(scroll infinito)
						</p>
						<button
							className="add-randoms-button"
							onClick={generateTodoList}
						>
							Gerar
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
