import { initTRPC } from "@trpc/server";
import { cache } from "react";
import { ZodError } from "zod";

// código de exemplo mínimo da documentação do TRPC (https://trpc.io/docs/client/tanstack-react-query/server-components)

export const createTRPCContext = cache(async () => {
	/**
	 * @see: https://trpc.io/docs/server/context
	 */
	return { userId: "user" };
});

const t = initTRPC.create({
	/**
	 * @see https://trpc.io/docs/server/data-transformers
	 */
	errorFormatter(opts) {
		const { shape, error } = opts;
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.code === "BAD_REQUEST" &&
					error.cause instanceof ZodError
						? error.cause.flatten()
						: null,
			},
		};
	},
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
