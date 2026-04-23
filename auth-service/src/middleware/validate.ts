import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

// Middleware factory — takes a zod schema, returns a middleware
// Usage: router.post('/register', validate(registerSchema), controller)

const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
       errors: result.error.issues.map(e => ({
  field: e.path.join('.'),
  message: e.message
}))
      })
      return
    }

    // Replace req.body with the validated + typed data
    req.body = result.data
    next()
  }
}

export default validate