import * as service from "./products.service.js";
import type { ValidatedHandler } from "../../middlewares/validator.js";
import {
  createProductValidation,
  listProductsValidation,
  productIdValidation,
  updateProductValidation,
} from "./products.validator.js";

export const list: ValidatedHandler<
  typeof listProductsValidation
> = async (_req, res) => {
  const query = res.locals.validated.query;
  const { items, total: totalItems } =
    await service.getProductsAsync(query);

  res.json({
    data: items,
    meta: {
      totalItems,
      count: items.length,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit),
      filters: query,
    },
  });
};

export const getById: ValidatedHandler<
  typeof productIdValidation
> = async (_req, res) => {
  const { id } = res.locals.validated.params;
  const product = await service.getProductByIdAsync(id);

  res.json(product);
};

export const createProduct: ValidatedHandler<
  typeof createProductValidation
> = async (_req, res) => {
  const input = res.locals.validated.body;
  const product = await service.createProductAsync(input);

  res.status(201).json(product);
};

export const updateProduct: ValidatedHandler<
  typeof updateProductValidation
> = async (_req, res) => {
  const { id } = res.locals.validated.params;
  const input = res.locals.validated.body;
  const product = await service.updateProductAsync(id, input);

  res.json(product);
};

export const deleteProduct: ValidatedHandler<
  typeof productIdValidation
> = async (_req, res) => {
  const { id } = res.locals.validated.params;

  await service.deleteProductAsync(id);

  res.status(204).end();
};