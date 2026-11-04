# Auditoría de la API de inventario

## Alcance y estado

Este documento resume la auditoría de los endpoints de productos y categorías, las correcciones realizadas y las comprobaciones ejecutadas. El proyecto usa Express 5, Zod 4, Prisma 7 y PostgreSQL.

Las pruebas HTTP descritas abajo se ejecutaron con registros temporales y se limpiaron al finalizar. No se añadieron todavía al repositorio como una suite automatizada.

## Hallazgos y correcciones

### Validación

- El precio de producto debe ser positivo, tener como máximo dos decimales y no superar `99_999_999.99`.
- El stock debe ser un entero entre `0` y `2_147_483_647`.
- El nombre de categoría debe tener entre 1 y 100 caracteres después de recortar espacios.
- La validación se aplica a creación y actualización. Los errores de Zod se responden como `400 VALIDATION_ERROR` e incluyen detalles de campos.

### Errores HTTP y Prisma

- Los errores conocidos de Prisma se traducen a códigos y estados HTTP de la API; entre otros, se distinguen registros inexistentes (`P2025`), conflictos únicos (`P2002`) y errores de relación (`P2003`).
- `P2000` y `P2020` se traducen a `400 VALIDATION_ERROR`.
- Los errores inesperados se registran en el servidor y responden con `500 INTERNAL_ERROR` genérico, sin exponer detalles internos al cliente.
- La presencia de estos mapeos fue revisada en el middleware. No todos los casos de Prisma se provocaron directamente por HTTP ni mediante pruebas unitarias aisladas; en particular, las ramas defensivas `P2000`, `P2020` y `P2003` requieren pruebas automatizadas específicas para considerarse verificadas en ejecución.

### Listados y relaciones

- Los listados de productos y categorías exponen `meta.totalItems`, `count`, `page`, `limit` y `totalPages`.
- El total se obtiene con el mismo filtro aplicado a los resultados paginados.
- El listado de productos incluye la categoría relacionada, igual que la consulta de detalle.

### Campo de fecha del producto

El campo `updateAt` del modelo `Product` se corrigió a `updatedAt`. La migración `prisma/migrations/20261104034502_rename_product_updated_at/migration.sql` renombra la columna con SQL:

```sql
ALTER TABLE "Product" RENAME COLUMN "updateAt" TO "updatedAt";
```

La migración se aplicó y el cliente Prisma se regeneró. Se comprobó que el producto existente conservó su ID y demás datos, y que el valor anterior de `updateAt` quedó en `updatedAt`. El mapper de productos también usa `updatedAt`.

## Flujo de una petición

1. `src/app.ts` recibe la petición, parsea JSON y la dirige al router de productos o categorías.
2. El controlador valida parámetros, cuerpo o query con los esquemas Zod del módulo.
3. El controlador invoca el servicio, que aplica filtros y operaciones mediante Prisma. En los listados, el servicio consulta los datos y cuenta los registros con el mismo filtro.
4. Los resultados se convierten al formato de respuesta mediante el mapper cuando corresponde; el controlador responde con el estado y estructura HTTP adecuados.
5. Si ocurre un error, `errorHandler` traduce errores Zod, errores de aplicación y errores conocidos de Prisma. Las rutas inexistentes pasan por `notFoundHandler`; los demás errores inesperados reciben una respuesta genérica `500`.

## Pruebas ejecutadas

### Validación HTTP: 22/22 aprobadas

- Nombre de categoría de 100 caracteres: creación `201` y actualización `200`.
- Nombre de 101 caracteres o solo espacios: `400 VALIDATION_ERROR` en creación y actualización.
- Precio máximo `99_999_999.99` y stock máximo `2_147_483_647`: creación `201` y actualización `200`.
- Precio sobre el máximo, con más de dos decimales, cero o negativo: `400 VALIDATION_ERROR` en creación y actualización.
- Stock sobre el máximo, negativo o decimal: `400 VALIDATION_ERROR` en creación y actualización.
- Los registros temporales se eliminaron; la base quedó con un producto y dos categorías.

### CRUD HTTP: 6/6 comprobaciones aprobadas

- Creación de categoría y producto: `201`.
- Actualización de categoría: `200`, con el nombre actualizado.
- Eliminación de producto y luego de categoría vacía: `204`.
- Los datos temporales se limpiaron al finalizar.

### Listados, relación y compilación

- Se comprobaron listados filtrados y búsquedas sin coincidencias: respuesta `200`, lista vacía y `meta.totalItems: 0` cuando no hay resultados.
- Se comprobó que el listado y el detalle de producto incluyen la categoría.
- `npx tsc --noEmit` pasó tras la corrección del mapper.
- La migración quedó aplicada y `prisma migrate status` informó que la base estaba al día.

## Riesgos y consideraciones de migración

- La migración histórica `20261028220918_add_product_sku` agrega `sku` como columna `NOT NULL` sin valor por defecto ni backfill. Aplicarla sobre una tabla `Product` con filas existentes sin `sku` puede fallar.
- La migración `20261030005040_make_category_required` cambia `categoryId` a `NOT NULL`. El propio archivo advierte que la operación falla si hay filas con `categoryId` nulo.
- Esas migraciones ya aplicadas no se deben reescribir. Para una base que no las haya aplicado y contenga datos, se debe planificar un backfill antes de imponer restricciones obligatorias.
- El renombrado de `updateAt` se hizo como `RENAME COLUMN`, no como eliminación y recreación, para conservar los valores existentes.
- La unicidad de nombres de categoría puede distinguir mayúsculas y minúsculas según la colación de PostgreSQL. Falta decidir si nombres como `Perifericos` y `perifericos` deben considerarse iguales; actualmente no se documenta ni implementa normalización insensible a mayúsculas.

## Pendientes recomendados

1. Añadir tests automatizados aislados para las ramas Prisma `P2000`, `P2020` y `P2003`, además de una prueba del error inesperado.
2. Guardar en el repositorio los comandos o colección usados para las verificaciones HTTP, con instrucciones para usar una base de desarrollo.
3. Acordar y documentar la regla de mayúsculas/minúsculas para nombres de categoría.
4. Revisar los cambios pendientes, ejecutar las comprobaciones finales y crear un commit descriptivo.
