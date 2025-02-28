"use client";

import { useTRPC } from "@/utils/providers/TrpcProvider";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import PencilIcon from "./icons/PencilIcon"; // simples svg de um lápis
import TrashIcon from "./icons/TrashIcon"; // simples svg de uma lixeira
import CheckIcon from "./icons/CheckIcon"; // simples svg de um check

interface Feedback {
	text?: string;
	success?: boolean;
	show: boolean;
} // interface para definição de feedbacks de sucesso ou erro provindos das requisições de CRUD

const DisplayFeedback = ({ feedback }: { feedback: Feedback }) => {
	// componente para mostrar o feedback de sucesso ou erro das requisições de CRUD
	if (!feedback.show) return null; // show é false sempre que não houver feedback ou após 3 segundos de exibição (veja useEffect de feedback abaixo)

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
	const trpc = useTRPC(); // importado do Provider criado para o TRPC (veja arquivo "TrpcProvider.tsx")
	const { data, fetchNextPage, isFetchingNextPage, refetch } =
		useInfiniteQuery(
			// infiniteQuery é uma forma de implementação de scroll infinito para listagem dinâmica de tarefas
			trpc.todoList.infiniteQueryOptions(
				{ limit: 15 }, // requisita no máximo 15 tarefas por página
				{ getNextPageParam: (lastPage) => lastPage.nextCursor }
				// ^-- define a função para obter o cursor da próxima página (nextCursor é definido e retornado no arquivo _app.tsx)
			)
		);
	const addTodo = useMutation(
		trpc.addTodo.mutationOptions({
			onSettled: () => refetch(), // caso addTodo seja chamado, irá realizar um refetch para atualizar a listagem de tarefas
			onSuccess: () =>
				// caso seja um sucesso, exibe um feedback de sucesso com as informações abaixo
				setFeedback({
					text: "Tarefa adicionada com sucesso!",
					success: true,
					show: true,
				}),
			onError: (
				error // caso falhe (depende do throw error do backend), exibe um feedback de erro com as informações abaixo além do erro do backend
			) =>
				setFeedback({
					text: `Erro ao adicionar tarefa: ${error.message}`,
					success: false,
					show: true,
				}),
		})
	);
	const removeTodo = useMutation(
		// remove a tarefa selecionada e segue as mesmas regras descritas pelo addTodo acima
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
		// remove a tarefa selecionada e segue as mesmas regras descritas pelo addTodo acima
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
	// ^-- caso o valor seja diferente de null, significa que uma tarefa foi selecionada para ser editada
	const [feedback, setFeedback] = useState<Feedback | { show: false }>({
		show: false,
	});
	// ^-- estado do feedback, caso show seja true, o feedback será renderizado (veja componente DisplayFeedback acima)

	useEffect(() => {
		// useEffect que define o tempo de duração do feedback (3 segundos, mesmo valor na animação no "globals.css")
		const timer = setTimeout(() => {
			setFeedback({ show: false });
		}, 3000);

		return () => clearTimeout(timer);
	}, [feedback]);

	const generateTodoList = () => {
		// função que gera 50 tarefas de forma simples, apenas para visualização e testes do scroll infinito
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
		// useEffect responsável por adicionar um event listener de scroll e analisar quando o usuário chegou ao final do site
		const handleScroll = () => {
			if (
				window.innerHeight + window.scrollY >=
				document.body.offsetHeight - 10
				// tamanho da tela + quantidade de scroll deve ser maior ou igual ao tamanho total do site - 10px (margem de erro)
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
			{/* componente da lista de tarefas */}
			<div className="todo-list-container">
				{!data ? <h2>Carregando...</h2> : null}
				{data?.pages.map((page, i) => {
					// mapeia as páginas de tarefas retornadas pelo infiniteQuery (15 tarefas por página por padrão)
					return (
						<div key={i} className="todo-list">
							{page.paginatedTodos.map((todo) => {
								// mapeia cada tarefa de cada página
								const isEditing = editingTodoId === todo.id;
								// ^-- caso a tarefa seja a selecionada para edição, isEditing será true,
								// assim modificando seus estilos e permitindo a edição dos campos de título e descrição

								const todoDate = new Intl.DateTimeFormat(
									"pt-BR",
									{
										dateStyle: "short",
										timeStyle: "short",
									}
								).format(new Date(todo.dataCriacao));
								// ^-- formata a data para uma visualmente apropriada

								const handleTodoEdit = (
									e: React.FormEvent<HTMLFormElement>
								) => {
									// função responsável por gerir a edição de uma tarefa
									e.preventDefault(); // evita a recarga da página
									if (!isEditing) {
										// caso esta tarefa (selecionada) não esteja sendo editada...
										setEditingTodoId(todo.id); // habilita a edição da tarefa
									} else {
										// resgata os dados preenchidos do formulário (sem utilização de useState, evitando re-renderizações desnecessárias)
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
										}); // realiza a requisição de edição da tarefa selecionada com os novos dados

										setEditingTodoId(null); // desabilita a edição da tarefa
									}
								};

								// retorno de cada tarefa, como cada um é possível ser editado,
								// as tarefas foram renderizadas em um elemento "form" com os inputs desabilitados por padrão (apenas visualização)
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

			{/* componente da side bar */}
			<div className="side-bar">
				<div className="side-bar-inner">
					<h1>Criar nova tarefa</h1>
					<form
						className="create-form"
						onSubmit={(e) => {
							e.preventDefault(); // evita recarga da página
							const formData = new FormData(
								e.target as HTMLFormElement
							);
							const titulo = formData.get("titulo") as string;
							const descricao = formData.get(
								"descricao"
							) as string;
							// resgata os dados preenchidos do formulário

							addTodo.mutate({ titulo, descricao }); // realiza a requisição de adição da nova tarefa
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

			{/* compoenente do feedback */}
			<DisplayFeedback feedback={feedback} />
		</>
	);
}
