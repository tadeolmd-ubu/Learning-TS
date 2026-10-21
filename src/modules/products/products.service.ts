import { prisma } from "../../lib/client.prisma.js";
import { toNewProduct } from "./products.mapper.js";
import { NotFoundError } from "../../lib/errors.js";
import type { CreateProduct, UpdateProduct } from "./products.validator.js";

export type NewProduct = ReturnType<typeof toNewProduct>;

export async function createProductAsync(
  input: CreateProduct,
): Promise<NewProduct> {
  const newProduct = await prisma.product.create({
    data: {
      name: input.name,
      price: input.price,
      stock: input.stock,
    },
  });

  return toNewProduct(newProduct);
}

export async function updateProductAsync(
  id: string,
  input: UpdateProduct,
): Promise<NewProduct> {
  const existent = await prisma.product.findUnique({
    where: { id: id },
  });
  if (!existent) {
    throw new NotFoundError("Producto no encontrado");
  }
  const updatedProduct = await prisma.product.update({
    where: { id: id },
    data: input,
  });
  return toNewProduct(updatedProduct);
}

export async function getProductsAsync(): Promise<NewProduct[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return products.map(toNewProduct);
}

export async function getProductByIdAsync(id: string): Promise<NewProduct> {
  const product = await prisma.product.findUnique({
    where: { id: id },
  });
  if (!product) {
    throw new NotFoundError("Producto no encontrado");
  }
  return toNewProduct(product);
}

export async function deleteProductAsync(id: string): Promise<void> {
  const existent = await prisma.product.findUnique({
    where: { id: id },
  });
  if (!existent) {
    throw new NotFoundError("Producto no encontrado");
  }
  await prisma.product.delete({
    where: { id: id },
  });
}
