import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../../utils/db'
import { users } from '../../database/schema'
import { hashPassword } from '../../utils/password'
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { email, password, name } = result.data
  const db = getDb()

  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email))
  if (existingUser.length > 0) {
    throw createError({
      statusCode: 409,
      message: 'Email já está em uso',
    })
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password)
  const [insertResult] = await db.insert(users).values({
    email,
    passwordHash,
    name,
    role: 'editor',
  })

  const userId = insertResult.insertId

  // Generate tokens
  const payload = { userId, email, role: 'editor' }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  // Set refresh token as httpOnly cookie
  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })

  return {
    success: true,
    data: {
      accessToken,
      user: {
        id: userId,
        email,
        name,
        role: 'editor',
      },
    },
  }
})
