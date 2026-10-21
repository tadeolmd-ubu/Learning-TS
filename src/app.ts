import express from "express";

import {productsRouter} from "../src/modules/products/products.route.js"
import { errorHandler, notFoundHandler } from "./middlewares/errors.js";

const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API funcionando"
  });
});

app.use("/api/products", productsRouter);

app.use(notFoundHandler);   
app.use(errorHandler);

export default app;