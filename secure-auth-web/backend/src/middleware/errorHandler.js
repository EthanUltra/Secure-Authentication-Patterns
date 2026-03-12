const { ZodError } = require('zod')
const { AppError } = require('../utils/errors')

module.exports = function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors })
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message })
  }
  console.error(err)
  res.status(500).json({ status: 'error', message: 'Internal server error' })
}
