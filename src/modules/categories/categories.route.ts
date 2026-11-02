import { Router } from "express";
import * as controller from "./categories.controller.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", controller.list);
categoriesRouter.post("/", controller.createCategory);
categoriesRouter.get("/:id", controller.getById);
categoriesRouter.patch("/:id", controller.updateCategory);
categoriesRouter.delete("/:id", controller.deleteCategory)
