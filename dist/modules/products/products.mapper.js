export function toNewProduct(p) {
    return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        price: p.price.toString(), // Decimal  "1999.99"
        stock: p.stock,
        createdAt: p.createdAt,
        updateAt: p.updateAt,
    };
}
