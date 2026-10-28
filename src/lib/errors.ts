export type AppErrorCode =
  | "PRODUCT_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "DUPLICATE_PRODUCT"
  | "ROUTE_NOT_FOUND"
  | "INTERNAL_ERROR"
  | "CONFLICT"
  | "INVALID_JSON";

export type ErrorDetail = {
  field: string;
  message: string;
};

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    public readonly statusCode: number,
    message: string,
    public readonly details?: ErrorDetail[],
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}
