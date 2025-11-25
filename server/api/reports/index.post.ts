import { z } from 'zod'
import { getDb } from '../../utils/db'
import { reports } from '../../database/schema'
import { verifyAccessToken, extractTokenFromHeader } from '../../utils/jwt'

const createReportSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  layout: z.object({
    version: z.string(),
    pageSettings: z.object({
      width: z.number(),
      height: z.number(),
      orientation: z.enum(['portrait', 'landscape']),
      margins: z.object({
        top: z.number(),
        right: z.number(),
        bottom: z.number(),
        left: z.number(),
      }),
      backgroundColor: z.string(),
    }),
    bands: z.array(z.any()),
  }),
  settings: z.record(z.any()).optional(),
})

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    throw createError({ statusCode: 401, message: 'Token não fornecido' })
  }

  try {
    const payload = verifyAccessToken(token)
    const body = await readBody(event)

    const result = createReportSchema.safeParse(body)
    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: result.error.errors[0].message,
      })
    }

    const db = getDb()
    const [insertResult] = await db.insert(reports).values({
      userId: payload.userId,
      title: result.data.title,
      description: result.data.description,
      layout: result.data.layout,
      settings: result.data.settings,
    })

    return {
      success: true,
      data: {
        id: insertResult.insertId,
        ...result.data,
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'Erro ao criar relatório' })
  }
})
