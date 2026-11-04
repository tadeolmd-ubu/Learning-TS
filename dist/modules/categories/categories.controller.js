import * as service from "./categories.service.js";
import { createCategorySchema, updateCategorySchema, idParamSchema, listCategorysQuerySchema, } from "./categories.validator.js";
export async function list(req, res) {
    const query = listCategorysQuerySchema.parse(req.query);
    const { items, total: totalItems } = await service.getCategoriesAsync(query);
    return res.json({
        data: items,
        meta: {
            totalItems,
            count: items.length,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(totalItems / query.limit),
            filters: query,
        },
    });
}
export async function getById(req, res) {
    const { id } = idParamSchema.parse({ id: req.params.id });
    return res.json(await service.getCategoryByIdAsync(id));
}
export async function createCategory(req, res) {
    const input = createCategorySchema.parse(req.body);
    return res.status(201).json(await service.createCategoryAsync(input));
}
export async function updateCategory(req, res) {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const input = updateCategorySchema.parse(req.body);
    return res.json(await service.updateCategoryAsync(id, input));
}
export async function deleteCategory(req, res) {
    const { id } = idParamSchema.parse({ id: req.params.id });
    await service.deleteCategoryAsync(id);
    return res.status(204).end();
}
