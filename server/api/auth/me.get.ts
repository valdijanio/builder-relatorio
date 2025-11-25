import { eq } from 'drizzle-orm'
import { getDb } from '../../utils/db'
import { users } from '../../database/schema'
import { verifyAccessToken, extractTokenFromHeader } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Token não fornecido',
    })
  }

  try {
    const payload = verifyAccessToken(token)
    const db = getDb()

    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    }).from(users).where(eq(users.id, payload.userId))

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Usuário não encontrado',
      })
    }

    return {
      success: true,
      data: { user },
    }
  } catch {
    throw createError({
      statusCode: 401,
      message: 'Token inválido ou expirado',
    })
  }
})
