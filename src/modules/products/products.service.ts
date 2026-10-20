import { prisma } from "../../lib/client.prisma.js";
import {toNewProduct} from "./products.mapper.js"
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

export async function updateProduct(id:string, input: UpdateProduct ): Promise<NewProduct>{
    const existent = await prisma.product.findUnique({
        where: {id: id}
    })
    if (!existent){
        throw new NotFoundError("El producto no encontrado");
    }
    const updatedProduct = await prisma.product.update({
        where: {id: id},
        data:input
    })
    return toNewProduct(updatedProduct);
}