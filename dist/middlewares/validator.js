export function validate(schemas) {
    return (req, res, next) => {
        const parsed = {};
        for (const source of ["params", "query", "body"]) {
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
        res.locals.validated = parsed;
        next();
    };
}
