class ApiError extends Error {
  constructor(statusCode = 500, message = "", data = {}, stack = "") {
    super(message || "Something went wrong");
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.data = data;
    this.stack = stack || Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      data: this.data,
      errors: this.errors,
    };
  }
}

export { ApiError };
