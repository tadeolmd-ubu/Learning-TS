import {Request, Response} from "express"
import * as service from "./categories.service.js"
import {
  createCategorySchema,
  updateCategorySchema,
  idSchema,
  listCategorysQuerySchema
} from "./categories.validator.js";

export async function list(req: Request, res: Response){
    const query = listCategorysQuerySchema.parse(req.params);
}