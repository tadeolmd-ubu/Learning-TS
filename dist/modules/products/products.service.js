import { prisma } from "../../lib/client.prisma.js";
import { toNewProduct } from "./products.mapper.js";
import { AppError } from "../../lib/errors.js";
export async function createProductAsync(input) {
    const newProduct = await prisma.product.create({
        data: {
            sku: input.sku,
            name: input.name,
            price: input.price,
            stock: input.stock,
        },
    });
    return toNewProduct(newProduct);
}
export async function updateProductAsync(id, input) {
    const updatedProduct = await prisma.product.update({
        where: { id: id },
        data: input,
    });
    return toNewProduct(updatedProduct);
}
export async function getProductsAsync(query) {
    const { search, minPrice, maxPrice, inStock, page, limit, sortBy, order } = query;
    const conditions = [];
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
    if (inStock !== undefined) {
        conditions.push({ stock: inStock ? { gt: 0 } : { lte: 0 } });
    }
    const where = conditions.length > 0 ? { AND: conditions } : {};
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
export async function getProductByIdAsync(id) {
    const product = await prisma.product.findUnique({
        where: { id: id },
    });
    if (!product) {
        throw new AppError("PRODUCT_NOT_FOUND", 404, "Producto no encontrado");
    }
    return toNewProduct(product);
}
export async function deleteProductAsync(id) {
    await prisma.product.delete({
        where: { id: id },
    });
}
