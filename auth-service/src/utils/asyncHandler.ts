import { Request, Response, NextFunction } from 'express'

// Wraps async controller functions so we don't need
// try/catch in every single controller
// Instead of:
//   async (req, res, next) => { try { ... } catch(e) { next(e) } }
// We write:
//   asyncHandler(async (req, res) => { ... })

const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default asyncHandler