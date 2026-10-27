import { ZodError } from "zod";
import { AppError } from "../lib/errors.js";
import { Prisma } from "../generated/prisma/client.js";
export function notFoundHandler(req, res) {
    res.status(404).json({
        status: "error",
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
}
export function errorHandler(err, _req, res, _next) {
    // 1) Validación Zod → 400
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: "error",
            message: "Datos inválidos",
            issues: err.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
            })),
        });
    }
    if (err instanceof AppError) {
        return res.status(err.status).json({
            status: "error",
            message: err.message,
        });
    }
    // 3) JSON malformado que lanza express.json()
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({ status: "error", message: "JSON inválido" });
    }
    // 4) Errores conocidos de Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2025": // registro no encontrado (carrera en update/delete)
                return res.status(404).json({
                    status: "error",
                    message: "Recurso no encontrado",
                });
            case "P2002": {
                // violación de UNIQUE
                const campos = err.meta?.target?.join(", ");
                return res.status(409).json({
                    status: "error",
                    message: campos
                        ? `Ya existe un registro con ese valor en: ${campos}`
                        : "Conflicto: valor duplicado",
                });
            }
            case "P2003": // violación de foreign key
                return res.status(409).json({
                    status: "error",
                    message: "Operación bloqueada por una referencia existente",
                });
        }
    }
    // 5) Todo lo demás → 500 (log interno, sin filtrar detalles al cliente)
    console.error("[error no controlado]", err);
    return res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
    });
}
