import type { QueryResult } from '~/types/elements'

export const useQueryExecutor = () => {
  const { authFetch } = useAuth()

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastResult = ref<QueryResult | null>(null)

  const executeQuery = async (sql: string, params: unknown[] = []): Promise<QueryResult | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<{ success: boolean; data: QueryResult; message?: string }>('/api/query/execute', {
        method: 'POST',
        body: { sql, params },
      })

      if (response.success && response.data) {
        lastResult.value = response.data
        return response.data
      } else {
        error.value = response.message || 'Erro ao executar query'
        return null
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Erro ao executar query'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const testQuery = async (sql: string): Promise<boolean> => {
    const result = await executeQuery(sql)
    return result !== null
  }

  return {
    executeQuery,
    testQuery,
    isLoading,
    error,
    lastResult,
  }
}
