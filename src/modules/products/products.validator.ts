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

const priceSchema = z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).pipe(z.number().min(0).max(99999999.99));

export const listProductsQuerySchema = z
  .strictObject({
    name: z.string().trim().min(1).max(100).optional(),
    minPrice: priceSchema.optional(),
    maxPrice: priceSchema.optional(),
    inStock: z.enum(["true", "false"]).transform((val) => val === "true").optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(["name", "price", "id", "stock"]).default("name"),
    order: z.enum(["asc", "desc"]).default("asc")
  })
  .superRefine((query, ctx) => {
    if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
      ctx.addIssue({ code: "custom", path: ["minPrice"], message: "minPrice no puede ser mayor que maxPrice" });
    }
  });
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type ListProductQuery = z.infer<typeof listProductsQuerySchema>;