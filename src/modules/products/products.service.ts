import { prisma } from "../../lib/client.prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { toNewProduct } from "./products.mapper.js";
import { AppError } from "../../lib/errors.js";
import type {
  CreateProduct,
  UpdateProduct,
  ListProductQuery,
} from "./products.validator.js";

export type NewProduct = ReturnType<typeof toNewProduct>;

export async function createProductAsync(
  input: CreateProduct,
): Promise<NewProduct> {
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });

  if (!category) {
    throw new AppError(
      "CATEGORY_NOT_FOUND",
      404,
      "La categoria no existe o no se encontro",
    );
  }

  const newProduct = await prisma.product.create({
    data: {
      sku: input.sku,
      name: input.name,
      price: input.price,
      stock: input.stock,
      categoryId: input.categoryId,
    },
  });

  return toNewProduct(newProduct);
}

export async function updateProductAsync(
  id: string,
  input: UpdateProduct,
): Promise<NewProduct> {
  if (input.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw new AppError(
        "CATEGORY_NOT_FOUND",
        404,
        "La categoria no existe o no se encontro",
      );
    }
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
  const {
    search,
    minPrice,
    maxPrice,
    inStock,
    page,
    limit,
    sortBy,
    order,
    categoryId,
  } = query;
  const conditions: Prisma.ProductWhereInput[] = [];

  if (search !== undefined) {
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    conditions.push({
      price: {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      },
    });
  }

  if (categoryId !== undefined) {
    conditions.push({ categoryId });
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
    include: { category: true },
  });
  if (!product) {
    throw new AppError("PRODUCT_NOT_FOUND", 404, "Producto no encontrado");
  }
  return toNewProduct(product);
}

export async function deleteProductAsync(id: string): Promise<void> {
  await prisma.product.delete({
    where: { id: id },
  });
}
