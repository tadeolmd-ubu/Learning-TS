import { prisma } from "../../lib/client.prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { toNewProduct } from "./products.mapper.js";
import { NotFoundError } from "../../lib/errors.js";
import type {
  CreateProduct,
  UpdateProduct,
  ListProductQuery,
} from "./products.validator.js";

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

export async function getProductsAsync(
  query: ListProductQuery,
): Promise<{ items: NewProduct[]; total: number }> {
  const { search, minPrice, maxPrice, inStock, page, limit, sortBy, order } =
    query;
  const conditions: Prisma.ProductWhereInput[] = [];

  if (search !== undefined) {
    conditions.push({ name: { contains: search, mode: "insensitive" } });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    conditions.push({
      price: {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      },
    });
  }

  if (inStock !== undefined) {
    conditions.push({ stock: inStock ? { gt: 0 } : { lte: 0 } });
  }

  const where: Prisma.ProductWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const skip = (page - 1) * limit;
  const take = limit;

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: [{ [sortBy]: order }, { id: "asc" }],
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return { items: products.map(toNewProduct), total };
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
