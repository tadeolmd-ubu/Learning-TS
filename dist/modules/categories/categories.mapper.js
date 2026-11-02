export function toNewCategory(c) {
    return {
        name: c.name,
        id: c.id,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    };
}
