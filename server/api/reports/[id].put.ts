import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../../utils/db'
import { reports } from '../../database/schema'
import { verifyAccessToken, extractTokenFromHeader } from '../../utils/jwt'

const updateReportSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  layout: z.any().optional(),
  settings: z.record(z.any()).optional(),
  isPublished: z.boolean().optional(),
})

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
    const body = await readBody(event)

    const result = updateReportSchema.safeParse(body)
    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: result.error.errors[0].message,
      })
    }

    const db = getDb()

    // Verify ownership
    const [existing] = await db.select({ id: reports.id }).from(reports).where(
      and(eq(reports.id, id), eq(reports.userId, payload.userId))
    )

    if (!existing) {
      throw createError({ statusCode: 404, message: 'Relatório não encontrado' })
    }

    // Update
    await db.update(reports).set(result.data).where(eq(reports.id, id))

    // Fetch updated
    const [updated] = await db.select().from(reports).where(eq(reports.id, id))

    return {
      success: true,
      data: updated,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'Erro ao atualizar relatório' })
  }
})
