export class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, statusCode, message, details, options) {
        super(message, options);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = new.target.name;
    }
}
