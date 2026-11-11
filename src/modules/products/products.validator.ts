import * as z from "zod";

export const idParamSchema = z.strictObject({ id: z.uuid() });

const MAX_PRICE = 99_999_999.99;
const MAX_STOCK = 2_147_483_647;

const productPriceSchema = z
  .number()
  .positive()
  .max(MAX_PRICE)
  .multipleOf(0.01);

const queryPriceSchema = z
  .string()
  .trim()
  .regex(/^\d{1,8}(?:\.\d{1,2})?$/)
  .transform(Number)
  .pipe(z.number().min(0).max(MAX_PRICE));

export const skuSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .regex(/^[A-Za-z0-9-]+$/, "El SKU solo admite letras, números y guiones")
  .transform((value) => value.toUpperCase());

export const createProductSchema = z.strictObject({
  sku: skuSchema,
  name: z.string().trim().min(1),
  price: productPriceSchema,
  stock: z.int().min(0).max(MAX_STOCK),
  categoryId: z.uuid(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: "Cuerpo vacío" });

export const listProductsQuerySchema = z
  .strictObject({
    search: z.string().trim().min(1).max(100).optional(),
    minPrice: queryPriceSchema.optional(),
    maxPrice: queryPriceSchema.optional(),
    categoryId: z.uuid().optional(),
    inStock: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z
      .enum(["name", "price", "createdAt", "stock", "sku", "categoryId"])
      .default("name"),
    order: z.enum(["asc", "desc"]).default("asc"),
  })
  .superRefine((query, ctx) => {
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minPrice"],
        message: "minPrice no puede ser mayor que maxPrice",
      });
    }
  });

export const createProductValidation = {
  body: createProductSchema,
} as const;

export const updateProductValidation = {
  params: idParamSchema,
  body: updateProductSchema,
} as const;

export const productIdValidation = {
  params: idParamSchema,
} as const;

export const listProductsValidation = {
  query: listProductsQuerySchema,
} as const;

export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type ListProductQuery = z.infer<typeof listProductsQuerySchema>;
