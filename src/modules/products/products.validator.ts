import * as z from "zod";

export const createProduct = z.object({
    name: z.string(),
    price: z.number(),
    stock: z.int(),
})

export type CreateProduct = z.infer<typeof createProduct>;