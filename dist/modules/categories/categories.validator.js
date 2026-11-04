import * as z from "zod";
export const createCategorySchema = z.strictObject({
    name: z.string().trim().min(1).max(100),
});
export const updateCategorySchema = createCategorySchema
    .partial()
    .refine((o) => Object.keys(o).length > 0, { message: "Cuerpo vacio" });
export const idParamSchema = z.strictObject({ id: z.uuid() });
export const listCategorysQuerySchema = z.strictObject({
    search: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    order: z.enum(["asc", "desc"]).default("asc"),
    sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
});
