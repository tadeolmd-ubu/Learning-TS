import type { Request, Response } from "express";
import * as service from "./products.service.js";
import {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
} from "./products.validator.js";

export async function list(_req: Request, res: Response) {
  res.json(await service.getProductsAsync());
}
export async function getById(req: Request, res: Response) {
  const id = idParamSchema.parse(req.body.id);
  res.json(await service.getProductByIdAsync(id));
}

export async function createProduct(req: Request, res: Response) {
  const input = createProductSchema.parse(req.body);
  res.status(201).json(await service.createProductAsync(input));
}

export async function updateProduct(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const input = updateProductSchema.parse(req.body.id);
  res.json(await service.updateProductAsync(id, input));
}

export async function deleteProduct(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  await service.deleteProductAsync(id);
  res.status(204).end;
}
