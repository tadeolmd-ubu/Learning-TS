import { Request, Response } from "express";
import * as service from "./categories.service.js";
import {
  createCategorySchema,
  updateCategorySchema,
  idSchema,
  listCategorysQuerySchema,
} from "./categories.validator.js";

export async function list(req: Request, res: Response) {
  const query = listCategorysQuerySchema.parse(req.query);
  const { items, total } = await service.getCategoriesAsync(query);
  return res.json({
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
  const { id } = idSchema.parse({ id: req.params.id });
  return res.json(await service.getCategoryByIdAsync(id));
}

export async function createCategory(req: Request, res: Response) {
  const input = createCategorySchema.parse(req.body);
  return res.status(201).json(await service.createCategoryAsync(input));
}
export async function updateCategory(req: Request, res: Response) {
  const { id } = idSchema.parse({ id: req.params.id });
  const input = updateCategorySchema.parse(req.body);

  return res.json(await service.updateCategoryAsync(id, input));
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = idSchema.parse({ id: req.params.id });
  await service.deleteCategoryAsync(id);
  return res.status(204).end();
}
