class AppError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode }
}
class AuthError     extends AppError { constructor(m) { super(m, 401) } }
class ConflictError extends AppError { constructor(m) { super(m, 409) } }
class NotFoundError extends AppError { constructor(m) { super(m, 404) } }
class ValidationError extends AppError { constructor(m) { super(m, 400) } }

module.exports = { AppError, AuthError, ConflictError, NotFoundError, ValidationError }
