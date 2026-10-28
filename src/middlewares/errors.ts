import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import {
  AppError,
  type AppErrorCode,
  type ErrorDetail,
} from "../lib/errors.js";
import { Prisma } from "../generated/prisma/client.js";

function sendError(
  res: Response,
  status: number,
  code: AppErrorCode,
  message: string,
  details?: ErrorDetail[],
) {
  return res.status(status).json({
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
    },
  });
}

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(
    new AppError(
      "ROUTE_NOT_FOUND",
      404,
      `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    ),
  );
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Si la respuesta ya empezó a enviarse, Express debe cerrar la conexión.
  if (res.headersSent) {
    return next(err);
  }

  // 1) Validación Zod → 400
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.map(String).join("."),
      message: issue.message,
    }));
    return sendError(res, 400, "VALIDATION_ERROR", "Datos inválidos", details);
  }

  // 2) Errores conocidos de la aplicación → su status y código
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  // 3) JSON malformado que lanza express.json()
  if (err instanceof SyntaxError && "body" in err) {
    return sendError(res, 400, "INVALID_JSON", "JSON inválido");
  }

  // 4) Errores conocidos de Prisma (traducción selectiva por contexto)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2025": {
        // registro no encontrado (carrera en update/delete)
        return sendError(
          res,
          404,
          "PRODUCT_NOT_FOUND",
          "Producto no encontrado",
        );
      }

      case "P2002": {
        const target = uniqueTarget(err.meta);
        if (target.includes("sku")) {
          return sendError(
            res,
            409,
            "DUPLICATE_PRODUCT",
            "Ya existe un producto con ese SKU",
          );
        }
        return sendError(
          res,
          409,
          "CONFLICT",
          "La operación entra en conflicto con un registro existente",
        );
      }
      case "P2003":
        return sendError(
          res,
          409,
          "CONFLICT",
          "La operación entra en conflicto con otros registros",
        );
    }
  }

  // 5) Todo lo demás → 500. El detalle técnico solo va al log del servidor.
  logUnexpectedError(err, req);
  return sendError(res, 500, "INTERNAL_ERROR", "Error interno del servidor");
}
/**
 * El campo afectado por una violación UNIQUE no está tipado de forma fiable.
 * Puede venir en `meta.target` (string | string[]) o, con los driver adapters
 * de Prisma 7, en `meta.driverAdapterError.cause.constraint` como nombre de
 * índice (`Product_sku_key`) o lista de campos.
 */
function uniqueTarget(meta: unknown): string {
  if (!meta || typeof meta !== "object") return "";

  const record = meta as Record<string, unknown>;
  const candidates: string[] = [];

  const target = record.target;
  if (Array.isArray(target)) {
    candidates.push(
      ...target.filter((value): value is string => typeof value === "string"),
    );
  } else if (typeof target === "string") {
    candidates.push(target);
  }

  const driverError = record.driverAdapterError;
  if (driverError && typeof driverError === "object") {
    const cause = (driverError as Record<string, unknown>).cause;
    if (cause && typeof cause === "object") {
      const constraint = (cause as Record<string, unknown>).constraint;
      if (constraint && typeof constraint === "object") {
        const details = constraint as Record<string, unknown>;
        if (typeof details.index === "string") candidates.push(details.index);
        if (Array.isArray(details.fields)) {
          candidates.push(
            ...details.fields.filter(
              (value): value is string => typeof value === "string",
            ),
          );
        }
      }
    }
  }

  if (typeof record.constraint === "string") candidates.push(record.constraint);

  return candidates.join(",").toLowerCase();
}

const DATABASE_URL_PATTERN = /postgres(?:ql)?:\/\/[^\s"']+/gi;

function redact(text: string): string {
  return text.replace(DATABASE_URL_PATTERN, "[REDACTED_DATABASE_URL]");
}

function logUnexpectedError(err: unknown, req: Request): void {
  const context = {
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  };

  if (err instanceof Error) {
    console.error("[error-interno]", {
      ...context,
      name: err.name,
      message: redact(err.message),
      stack: err.stack ? redact(err.stack) : undefined,
    });
    return;
  }

  console.error("[error-interno]", {
    ...context,
    error: redact(String(err)),
  });
}
