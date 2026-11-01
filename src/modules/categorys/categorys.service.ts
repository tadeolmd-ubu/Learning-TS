import { prisma } from "../../lib/client.prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { toNewCategory } from "./categorys.mapper.js";
import { AppError } from "../../lib/errors.js";
import type {
  CreateCategory,
  UpdateCategory,
  ListCategoriesQuery,
} from "./categorys.validator.js";

export type NewCategory = ReturnType<typeof toNewCategory>;

export async function createCategoryAsync(
  input: CreateCategory,
): Promise<NewCategory> {
  const newCategory = await prisma.category.create({
    data: {
      name: input.name,
    },
  });
  return toNewCategory(newCategory);
}

export async function updateCategoryAsync(
  id: string,
  input: UpdateCategory,
): Promise<NewCategory> {
  const updatedCategory = await prisma.category.update({
    where: { id: id },
    data: input,
  });
  return toNewCategory(updatedCategory);
}

export async function deleteCategoryAsync(id: string): Promise<void> {
  const products = await prisma.product.count({ where: { categoryId: id } });
  if (products > 0) {
    throw new AppError(
      "CATEGORY_HAS_PRODUCTS",
      409,
      "La categoria esta asociada a algun producto",
    );
  } else {
    await prisma.category.delete({ where: { id } });
  }
}
export async function getCategoriesAsync(
  query: ListCategoriesQuery,
): Promise<{ items: NewCategory[]; total: number }> {
  const { search, page, limit, order, sortBy } = query;
  const conditions: Prisma.CategoryWhereInput[] = [];

  if (search !== undefined) {
    conditions.push({ name: { contains: search, mode: "insensitive" } });
  }
  const where: Prisma.CategoryWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const skip = (page - 1) * limit;
  const take = limit;

  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      orderBy: [{ [sortBy]: order }, { id: "asc" }],
      skip,
      take,
    }),
    prisma.category.count({ where }),
  ]);
  return { items: categories.map(toNewCategory), total };
}

export async function getCategoryByIdAsync(id: string) {
  const category = await prisma.category.findUnique({ where: { id: id } });

  if (!category) {
    throw new AppError("CATEGORY_NOT_FOUND", 404, "categoria no encontrada");
  }
  return toNewCategory(category);
}
