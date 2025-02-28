"use client";

import { useTRPC } from "@/utils/providers/TrpcProvider";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";
import CheckIcon from "./icons/CheckIcon";

interface Feedback {
	text?: string;
	success?: boolean;
	show: boolean;
}

const DisplayFeedback = ({ feedback }: { feedback: Feedback }) => {
	if (!feedback.show) return null;

	return (
		<div
			className={
				"feedback-container" + (feedback.success ? "" : " error")
			}
		>
			{feedback.text}
		</div>
	);
};

export default function TodoList() {
	const trpc = useTRPC();
	const { data, fetchNextPage, isFetchingNextPage, refetch } =
		useInfiniteQuery(
			trpc.todoList.infiniteQueryOptions(
				{ limit: 15 },
				{ getNextPageParam: (lastPage) => lastPage.nextCursor }
			)
		);
	const addTodo = useMutation(
		trpc.addTodo.mutationOptions({
			onSettled: () => refetch(),
			onSuccess: () =>
				setFeedback({
					text: "Tarefa adicionada com sucesso!",
					success: true,
					show: true,
				}),
			onError: (error) =>
				setFeedback({
					text: `Erro ao adicionar tarefa: ${error.message}`,
					success: false,
					show: true,
				}),
		})
	);
	const removeTodo = useMutation(
		trpc.removeTodo.mutationOptions({
			onSettled: () => refetch(),
			onSuccess: () =>
				setFeedback({
					text: "Tarefa removida com sucesso!",
					success: true,
					show: true,
				}),
			onError: (error) =>
				setFeedback({
					text: `Erro ao remover tarefa: ${error.message}`,
					success: false,
					show: true,
				}),
		})
	);
	const editTodo = useMutation(
		trpc.editTodo.mutationOptions({
			onSettled: () => refetch(),
			onSuccess: () =>
				setFeedback({
					text: "Tarefa editada com sucesso!",
					success: true,
					show: true,
				}),
			onError: (error) =>
				setFeedback({
					text: `Erro ao editar tarefa: ${error.message}`,
					success: false,
					show: true,
				}),
		})
	);

	const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
	const [feedback, setFeedback] = useState<Feedback | { show: false }>({
		show: false,
	});

	useEffect(() => {
		const timer = setTimeout(() => {
			setFeedback({ show: false });
		}, 3000);

		return () => clearTimeout(timer);
	}, [feedback]);

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
			if (
				window.innerHeight + window.scrollY >=
				document.body.offsetHeight - 10
			) {
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
			<div className="todo-list-container">
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
											maxLength={512}
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
							maxLength={512}
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

			<DisplayFeedback feedback={feedback} />
		</>
	);
}
