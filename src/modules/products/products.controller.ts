import type { Request, Response } from "express";
import * as service from "./products.service.js";
import {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  listProductsQuerySchema
} from "./products.validator.js";

export async function list(req: Request, res: Response) {
  const query = listProductsQuerySchema.parse(req.query);
  const { items, total } = await service.getProductsAsync(query);
  res.json({
    data: items,
    meta: {
      total,
      count: items.length,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
      filters: query,
    },
  });
}
export async function getById(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  res.json(await service.getProductByIdAsync(id));
}

export async function createProduct(req: Request, res: Response) {
  const input = createProductSchema.parse(req.body);
  res.status(201).json(await service.createProductAsync(input));
}

export async function updateProduct(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const input = updateProductSchema.parse(req.body);
  res.json(await service.updateProductAsync(id, input));
}

export async function deleteProduct(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  await service.deleteProductAsync(id);
  res.status(204).end();
}
