import type { Category } from "../../generated/prisma/client.js";

export function toNewCategory(c: Category) {
  return {
    name: c.name,
    id: c.id,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}
