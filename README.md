Este é um simples site de uma página com uma listagem de TODOS (tarefas) que podem ser **adicionadas, removidas e editadas (CRUD)** com a utilização do **TRPC (Typescript Remote Procedure Call)**. Foi feito para o Desafio Prático do teste de Intern Web Developer - Brazil da Artefact.

*OBS.: tudo é mantido em memória, se o site for reiniciado ou a página sofrer um hard refresh, todas as tarefas serão perdidas*

O site contém uma **side-bar a esquerda** que é utilizada gerenciar a adição de novas tarefas, contendo um formulário para adição de tarefas únicas e um botão para adição de várias tarefas que tem o simples intuito de demonstrar a funcionalidade do scroll infinito com renderização e requisição dinâmicas de tarefas. A **direita está a listagem de tarefas** com Título (string, **obrigatório**), Descrição (string, **opcional**), ID (número, **obrigatório, único e gerado**) e Data de Criação (Date, **gerado**), onde cada uma pode ser editada e removida a partir da própria listagem.

![image](https://github.com/user-attachments/assets/956d63c6-13d0-460c-9d24-b8387dc697fd)

## Create with

O site foi feito utilizando [Next.js 15.0.2](https://nextjs.org/docs) com Typescript, inicialmente gerado utilizando o [Deno 2.1.4](https://docs.deno.com/examples/next_tutorial/) com o comando `deno run -A npm:create-next-app@latest`

Além disso, para gerenciar todas as tarefas com todas as operações CRUD, foi utilizado o [TRPC](https://trpc.io/docs/client/tanstack-react-query/server-components) seguindo as instruções para SSR.

## Getting Started

Primeiro, inicie o ambiente de desenvolvimento: 

```bash
deno run dev
# or
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para visualizar o site.
