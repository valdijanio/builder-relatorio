import { z } from 'zod'
import { executeRawQuery } from '../../utils/db'
import { validateSelectQuery, sanitizeQuery } from '../../utils/sql-sanitizer'
import { verifyAccessToken, extractTokenFromHeader } from '../../utils/jwt'

const executeQuerySchema = z.object({
  sql: z.string().min(1, 'Query SQL é obrigatória'),
  params: z.array(z.any()).optional().default([]),
})

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    throw createError({ statusCode: 401, message: 'Token não fornecido' })
  }

  try {
    verifyAccessToken(token)
    const body = await readBody(event)

    const result = executeQuerySchema.safeParse(body)
    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: result.error.errors[0].message,
      })
    }

    const { sql, params } = result.data

    // Validate query for security
    const validation = validateSelectQuery(sql)
    if (!validation.valid) {
      throw createError({
        statusCode: 400,
        message: validation.error || 'Query inválida',
      })
    }

    // Sanitize and execute
    const sanitizedSql = sanitizeQuery(sql)
    const startTime = Date.now()

    const rows = await executeRawQuery(sanitizedSql, params) as Record<string, unknown>[]
    const executionTimeMs = Date.now() - startTime

    // Get column names from first row
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return {
      success: true,
      data: {
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs,
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    // Handle database errors
    console.error('Query execution error:', error)
    throw createError({
      statusCode: 400,
      message: error.message || 'Erro ao executar query',
    })
  }
})
