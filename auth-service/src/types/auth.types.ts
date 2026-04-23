import { Request } from 'express'

export interface RegisterInput {
  email: string
  name: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface TokenPayload {
  userId: string
  email: string
}

// Extends Express Request so we can attach the user to it
// After authentication middleware runs, req.user is available
export interface AuthRequest extends Request {
  user?: TokenPayload
}