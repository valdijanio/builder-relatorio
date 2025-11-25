import { eq, and } from 'drizzle-orm'
import { getDb } from '../../utils/db'
import { reports } from '../../database/schema'
import { verifyAccessToken, extractTokenFromHeader } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = extractTokenFromHeader(authHeader)
  const id = parseInt(getRouterParam(event, 'id') || '0')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Token não fornecido' })
  }

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID inválido' })
  }

  try {
    const payload = verifyAccessToken(token)
    const db = getDb()

    // Verify ownership and delete
    const result = await db.delete(reports).where(
      and(eq(reports.id, id), eq(reports.userId, payload.userId))
    )

    if (result[0].affectedRows === 0) {
      throw createError({ statusCode: 404, message: 'Relatório não encontrado' })
    }

    return {
      success: true,
      message: 'Relatório excluído com sucesso',
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'Erro ao excluir relatório' })
  }
})
