import {Router} from "express";
import * as controller from "./products.controller.js"

export const productsRouter = Router();

productsRouter.get("/", controller.list);
productsRouter.get("/:id", controller.getById);
productsRouter.post("/", controller.createProduct);
productsRouter.patch("/:id", controller.updateProduct);
productsRouter.delete("/:id", controller.deleteProduct);