import * as z from "zod";


export const idParam = z.uuid();

export const createProduct = z.object({
    name: z.string(),
    price: z.number(),
    stock: z.int(),
});
export const updateProduct = createProduct
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: "Cuerpo vacío" });

export type CreateProduct = z.infer<typeof createProduct>;
export type UpdateProduct = z.infer<typeof updateProduct>;