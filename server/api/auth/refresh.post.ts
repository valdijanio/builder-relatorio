import { eq } from 'drizzle-orm'
import { getDb } from '../../utils/db'
import { users } from '../../database/schema'
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token')

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      message: 'Refresh token não fornecido',
    })
  }

  try {
    const payload = verifyRefreshToken(refreshToken)
    const db = getDb()

    // Verify user still exists
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId))
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Usuário não encontrado',
      })
    }

    // Generate new tokens
    const newPayload = { userId: user.id, email: user.email, role: user.role || 'editor' }
    const newAccessToken = generateAccessToken(newPayload)
    const newRefreshToken = generateRefreshToken(newPayload)

    // Set new refresh token
    setCookie(event, 'refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return {
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    }
  } catch {
    throw createError({
      statusCode: 401,
      message: 'Refresh token inválido ou expirado',
    })
  }
})
