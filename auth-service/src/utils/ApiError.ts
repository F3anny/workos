// A custom error class that carries an HTTP status code
// Instead of throwing generic errors we throw ApiErrors
// Our error handler then knows exactly what status code to send

class ApiError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError