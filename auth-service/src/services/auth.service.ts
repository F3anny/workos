import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/database'
import env from '../config/env'
import ApiError from '../utils/ApiError'
import { RegisterInput, LoginInput, TokenPayload } from '../types/auth.types'

// Generate a short-lived access token (15 minutes)
const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as any
  })
}

// Generate a long-lived refresh token (7 days)
const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as any
  })
}

export const register = async (input: RegisterInput) => {
  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: input.email }
  })

  if (existing) {
    throw new ApiError(409, 'Email already registered')
  }

  // Hash password — never store raw passwords
  // 12 = salt rounds, higher = slower = more secure
  const hashedPassword = await bcrypt.hash(input.password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashedPassword
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
      // notice: password is NOT selected — never return it
    }
  })

  // Generate tokens
  const payload: TokenPayload = { userId: user.id, email: user.email }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  // Store refresh token in database
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt
    }
  })

  return { user, accessToken, refreshToken }
}

export const login = async (input: LoginInput) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: input.email }
  })

  if (!user) {
    // Don't say "user not found" — that leaks info about who's registered
    throw new ApiError(401, 'Invalid email or password')
  }

  // Compare password with hash
  const isValidPassword = await bcrypt.compare(input.password, user.password)

  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password')
  }

  // Generate tokens
  const payload: TokenPayload = { userId: user.id, email: user.email }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  // Store refresh token
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt
    }
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    },
    accessToken,
    refreshToken
  }
}

export const refresh = async (token: string) => {
  // Verify the refresh token is valid
  let payload: TokenPayload

  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token')
  }

  // Check it exists in database and hasn't expired
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token }
  })

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new ApiError(401, 'Refresh token expired or revoked')
  }

  // Delete old refresh token (rotation — each refresh gets a new token)
  await prisma.refreshToken.delete({
    where: { token }
  })

  // Issue new tokens
  const newPayload: TokenPayload = {
    userId: payload.userId,
    email: payload.email
  }

  const newAccessToken = generateAccessToken(newPayload)
  const newRefreshToken = generateRefreshToken(newPayload)

  // Store new refresh token
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: payload.userId,
      expiresAt
    }
  })

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

export const logout = async (token: string) => {
  // Delete the refresh token — user is now logged out
  await prisma.refreshToken.deleteMany({
    where: { token }
  })
}