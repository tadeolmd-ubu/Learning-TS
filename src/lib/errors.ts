export class AppError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = new.target.name;   // "NotFoundError" en el stack
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") { super(message, 404); }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto") { super(message, 409); }
}