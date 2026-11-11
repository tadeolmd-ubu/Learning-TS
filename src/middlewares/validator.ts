import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import * as z from "zod";

type Source = "body" | "params" | "query";

export type ValidationSchemas = Partial<
  Record<Source, z.ZodType>
>;

type Parsed<S extends ValidationSchemas> = {
  [K in keyof S]: S[K] extends z.ZodType
    ? z.output<S[K]>
    : never;
};

export type ValidatedHandler<S extends ValidationSchemas> =
  RequestHandler<
    ParamsDictionary,
    unknown,
    unknown,
    unknown,
    { validated: Parsed<S> }
  >;

export function validate<S extends ValidationSchemas>(
  schemas: S,
): ValidatedHandler<S> {
  return (req, res, next) => {
    const parsed: Partial<Record<Source, unknown>> = {};

    for (const source of ["params", "query", "body"] as const) {
      const schema = schemas[source];

      if (!schema) {
        continue;
      }

      const result = schema.safeParse(req[source]);

      if (!result.success) {
        // El middleware centralizado recibirá el ZodError.
        next(result.error);
        return;
      }

      parsed[source] = result.data;
    }

    // La aserción queda localizada aquí: llegamos a esta línea solo
    // después de parsear cada esquema que venía en `schemas`.
    res.locals.validated = parsed as Parsed<S>;

    next();
  };
}