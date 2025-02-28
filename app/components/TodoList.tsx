"use client";

import { useTRPC } from "@/utils/providers/TrpcProvider";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";
import CheckIcon from "./icons/CheckIcon";

export default function TodoList() {
	const trpc = useTRPC();
	const { data, fetchNextPage, isFetchingNextPage, refetch } =
		useInfiniteQuery(
			trpc.todoList.infiniteQueryOptions(
				{ limit: 30 },
				{ getNextPageParam: (lastPage) => lastPage.nextCursor }
			)
		);
	const addTodo = useMutation(
		trpc.addTodo.mutationOptions({ onSettled: () => refetch() })
	);
	const removeTodo = useMutation(
		trpc.removeTodo.mutationOptions({ onSettled: () => refetch() })
	);
	const editTodo = useMutation(
		trpc.editTodo.mutationOptions({ onSettled: () => refetch() })
	);

	const [editingTodoId, setEditingTodoId] = useState<number | null>(null);

	const generateTodoList = () => {
		// IMPORTANTE: Seria possível e mais viável realizar apenas uma mutação com batch de tarefas
		// porém, para fins de simplificação, foi mantido o loop para simular a criação de várias tarefas

		for (let i = 0; i < 50; i++) {
			addTodo.mutate({
				titulo: `Tarefa ${i}`,
				descricao: `Descrição da tarefa ${i}`,
			});
		}
	};

	useEffect(() => {
		const handleScroll = () => {
			console.log(
				window.innerHeight + window.scrollY,
				document.body.offsetHeight
			);

			if (
				window.innerHeight + window.scrollY >=
				document.body.offsetHeight - 10
			) {
				console.log("true", isFetchingNextPage);
				if (!isFetchingNextPage) {
					fetchNextPage();
				}
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [fetchNextPage, isFetchingNextPage]);

	return (
		<>
			<div>
				{!data ? <h2>Carregando...</h2> : null}
				{data?.pages.map((page, i) => {
					return (
						<div key={i} className="todo-list">
							{page.paginatedTodos.map((todo) => {
								const isEditing = editingTodoId === todo.id;

								const todoDate = new Intl.DateTimeFormat(
									"pt-BR",
									{
										dateStyle: "short",
										timeStyle: "short",
									}
								).format(new Date(todo.dataCriacao));

								const handleTodoEdit = (
									e: React.FormEvent<HTMLFormElement>
								) => {
									e.preventDefault();
									if (!isEditing) {
										setEditingTodoId(todo.id);
									} else {
										const formData = new FormData(
											e.target as HTMLFormElement
										);
										const titulo = formData.get(
											"titulo"
										) as string;
										const descricao = formData.get(
											"descricao"
										) as string;
										editTodo.mutate({
											id: todo.id,
											titulo,
											descricao,
										});
										setEditingTodoId(null);
									}
								};

								return (
									<form
										key={todo.id}
										className="todo-container"
										onSubmit={(e) => handleTodoEdit(e)}
									>
										<input
											className={
												"todo-title" +
												(isEditing ? " editing" : "")
											}
											name="titulo"
											placeholder="Título"
											defaultValue={todo.titulo}
											type="text"
											required
											disabled={!isEditing}
										/>
										<textarea
											className={
												"todo-description" +
												(isEditing ? " editing" : "")
											}
											name="descricao"
											placeholder="Descrição"
											defaultValue={todo.descricao}
											rows={6}
											disabled={!isEditing}
										/>
										<div className="todo-date-id">
											Criado em: {todoDate} - ID:{" "}
											{todo.id}
										</div>
										<div className="todo-buttons-container">
											<button
												className={
													"edit-todo-button" +
													(isEditing
														? " editing"
														: "")
												}
												type="submit"
											>
												{isEditing ? (
													<CheckIcon />
												) : (
													<PencilIcon />
												)}
											</button>
											<button
												className="remove-todo-button"
												onClick={() =>
													removeTodo.mutate({
														id: todo.id,
													})
												}
											>
												<TrashIcon />
											</button>
										</div>
									</form>
								);
							})}
							{isFetchingNextPage ? (
								<h2>Carregando mais...</h2>
							) : null}
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
								type="text"
								required
							/>
							<span className="required-icon">*</span>
						</label>
						<textarea
							placeholder="Descrição"
							name="descricao"
							className="description-input"
							rows={5}
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
