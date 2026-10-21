import * as z from "zod";


export const idParamSchema = z.uuid();

export const createProductSchema = z.object({
    name: z.string(),
    price: z.number(),
    stock: z.int(),
});
export const updateProductSchema = createProductSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: "Cuerpo vacío" });

export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;