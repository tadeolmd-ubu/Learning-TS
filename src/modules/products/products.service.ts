import { prisma } from "../../lib/client.prisma.js";
import {toNewProduct} from "./products.mapper.js"
import type { CreateProduct } from "./products.validator.js";


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

