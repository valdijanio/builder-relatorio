import { eq } from 'drizzle-orm'
import { getDb } from '../../utils/db'
import { reports } from '../../database/schema'
import { verifyAccessToken, extractTokenFromHeader } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    throw createError({ statusCode: 401, message: 'Token não fornecido' })
  }

  try {
    const payload = verifyAccessToken(token)
    const db = getDb()

    const userReports = await db.select({
      id: reports.id,
      title: reports.title,
      description: reports.description,
      isPublished: reports.isPublished,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
    }).from(reports).where(eq(reports.userId, payload.userId))

    return {
      success: true,
      data: userReports,
    }
  } catch {
    throw createError({ statusCode: 401, message: 'Token inválido' })
  }
})
