import type { Product } from "../../generated/prisma/client.js";

export function toNewProduct(p: Product) {
  return {
    id: p.id,
    name: p.name,
    price: p.price.toString(), // Decimal  "1999.99"
    stock: p.stock,
    createdAt: p.createdAt,
    updateAt: p.updateAt,
  };
}

