import { Router } from "express";
import * as controller from "./products.controller.js";
import { validate } from "../../middlewares/validator.js";
import {
  createProductValidation,
  listProductsValidation,
  productIdValidation,
  updateProductValidation,
} from "./products.validator.js";

export const productsRouter = Router();

productsRouter.get("/", validate(listProductsValidation), controller.list);

productsRouter.get("/:id", validate(productIdValidation), controller.getById);

productsRouter.post(
  "/",
  validate(createProductValidation),
  controller.createProduct,
);

productsRouter.patch(
  "/:id",
  validate(updateProductValidation),
  controller.updateProduct,
);

productsRouter.delete(
  "/:id",
  validate(productIdValidation),
  controller.deleteProduct,
);
