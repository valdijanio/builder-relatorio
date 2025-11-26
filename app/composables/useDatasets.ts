import type { Dataset, DatasetField } from '~/types/report'

interface DatasetCache {
  rows: Record<string, unknown>[]
  fields: string[]
  executedAt: string  // ISO string for serialization
}

export const useDatasets = () => {
  // Estado global dos datasets do relatório atual
  const datasets = useState<Dataset[]>('report-datasets', () => [])

  // Cache de resultados executados (usando objeto simples ao invés de Map para serialização)
  const dataCache = useState<Record<string, DatasetCache>>('datasets-cache', () => ({}))

  // Datasets em loading (usando array ao invés de Set para serialização)
  const loadingDatasets = useState<string[]>('loading-datasets', () => [])

  // Erros por dataset (usando objeto simples ao invés de Map para serialização)
  const datasetErrors = useState<Record<string, string>>('dataset-errors', () => ({}))

  // Gerar ID único para novo dataset
  const generateDatasetId = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 6)
    return `ds_${timestamp}_${random}`
  }

  // Adicionar novo dataset
  const addDataset = (dataset: Omit<Dataset, 'id'>) => {
    const newDataset: Dataset = {
      ...dataset,
      id: generateDatasetId(),
    }
    datasets.value = [...datasets.value, newDataset]
    return newDataset
  }

  // Atualizar dataset existente
  const updateDataset = (id: string, updates: Partial<Dataset>) => {
    datasets.value = datasets.value.map((ds) =>
      ds.id === id ? { ...ds, ...updates } : ds
    )
    // Limpar cache quando query muda
    if (updates.sqlQuery) {
      const { [id]: _, ...rest } = dataCache.value
      dataCache.value = rest
      const { [id]: __, ...restErrors } = datasetErrors.value
      datasetErrors.value = restErrors
    }
  }

  // Remover dataset
  const removeDataset = (id: string) => {
    datasets.value = datasets.value.filter((ds) => ds.id !== id)
    const { [id]: _, ...restCache } = dataCache.value
    dataCache.value = restCache
    const { [id]: __, ...restErrors } = datasetErrors.value
    datasetErrors.value = restErrors
    loadingDatasets.value = loadingDatasets.value.filter(dsId => dsId !== id)
  }

  // Obter dataset por ID
  const getDataset = (id: string) => {
    return datasets.value.find((ds) => ds.id === id)
  }

  // Executar um dataset específico
  const executeDataset = async (
    id: string,
    params?: Record<string, unknown>
  ): Promise<DatasetCache | null> => {
    const dataset = getDataset(id)
    if (!dataset) {
      datasetErrors.value = { ...datasetErrors.value, [id]: 'Dataset não encontrado' }
      return null
    }

    loadingDatasets.value = [...loadingDatasets.value, id]
    const { [id]: _, ...restErrors } = datasetErrors.value
    datasetErrors.value = restErrors

    try {
      // Substituir parâmetros na query se houver
      let sql = dataset.sqlQuery
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          sql = sql.replace(new RegExp(`@${key}`, 'g'), String(value))
        })
      }

      // Lazy load useQueryExecutor to avoid SSR issues
      const { executeQuery } = useQueryExecutor()
      const result = await executeQuery(sql)

      if (result && result.rows) {
        const cache: DatasetCache = {
          rows: result.rows,
          fields: result.rows.length > 0 ? Object.keys(result.rows[0]) : [],
          executedAt: new Date().toISOString(),
        }
        dataCache.value = { ...dataCache.value, [id]: cache }

        // Auto-detectar campos se não definidos
        if (!dataset.fields || dataset.fields.length === 0) {
          const detectedFields: DatasetField[] = cache.fields.map((name) => {
            const sampleValue = result.rows[0]?.[name]
            let type: DatasetField['type'] = 'string'
            if (typeof sampleValue === 'number') type = 'number'
            else if (sampleValue instanceof Date) type = 'date'
            else if (typeof sampleValue === 'boolean') type = 'boolean'

            return { name, type }
          })
          updateDataset(id, { fields: detectedFields })
        }

        return cache
      } else {
        datasetErrors.value = { ...datasetErrors.value, [id]: 'Nenhum resultado retornado' }
        return null
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao executar query'
      datasetErrors.value = { ...datasetErrors.value, [id]: errorMsg }
      return null
    } finally {
      loadingDatasets.value = loadingDatasets.value.filter(dsId => dsId !== id)
    }
  }

  // Executar todos os datasets (para preview)
  const executeAllDatasets = async (params?: Record<string, unknown>) => {
    const promises = datasets.value.map((ds) => executeDataset(ds.id, params))
    await Promise.all(promises)
  }

  // Obter dados de um dataset do cache
  const getDatasetData = (id: string): Record<string, unknown>[] => {
    return dataCache.value[id]?.rows || []
  }

  // Obter campos disponíveis de um dataset
  const getDatasetFields = (id: string): string[] => {
    // Primeiro tenta do cache (campos reais)
    const cached = dataCache.value[id]
    if (cached && cached.fields.length > 0) {
      return cached.fields
    }

    // Fallback para campos definidos no dataset
    const dataset = getDataset(id)
    return dataset?.fields?.map((f) => f.name) || []
  }

  // Verificar se dataset está carregando
  const isDatasetLoading = (id: string) => {
    return loadingDatasets.value.includes(id)
  }

  // Obter erro de um dataset
  const getDatasetError = (id: string) => {
    return datasetErrors.value[id]
  }

  // Carregar datasets de um layout
  const loadDatasets = (layoutDatasets: Dataset[]) => {
    datasets.value = layoutDatasets || []
    dataCache.value = {}
    datasetErrors.value = {}
  }

  // Limpar tudo
  const clearDatasets = () => {
    datasets.value = []
    dataCache.value = {}
    datasetErrors.value = {}
    loadingDatasets.value = []
  }

  return {
    // Estado
    datasets: computed(() => datasets.value),
    loadingDatasets: computed(() => loadingDatasets.value),
    datasetErrors: computed(() => datasetErrors.value),
    dataCache: computed(() => dataCache.value),

    // CRUD
    addDataset,
    updateDataset,
    removeDataset,
    getDataset,

    // Execução
    executeDataset,
    executeAllDatasets,

    // Acesso a dados
    getDatasetData,
    getDatasetFields,
    isDatasetLoading,
    getDatasetError,

    // Gerenciamento
    loadDatasets,
    clearDatasets,
  }
}
