import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../../utils/db'
import { users } from '../../database/schema'
import { verifyPassword } from '../../utils/password'
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { email, password } = result.data
  const db = getDb()

  // Find user
  const [user] = await db.select().from(users).where(eq(users.email, email))
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Credenciais inválidas',
    })
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.passwordHash)
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      message: 'Credenciais inválidas',
    })
  }

  // Generate tokens
  const payload = { userId: user.id, email: user.email, role: user.role || 'editor' }
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
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
  }
})
