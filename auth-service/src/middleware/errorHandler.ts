import { Request, Response, NextFunction } from 'express'
import ApiError from '../utils/ApiError'

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  // If it's our custom ApiError we know the status code
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    })
    return
  }

  // Prisma errors — handle common ones
  if (err.message.includes('Unique constraint')) {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists'
    })
    return
  }

  // Unknown errors — don't leak details in production
  console.error('Unexpected error:', err)
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error'
  })
}

export default errorHandler