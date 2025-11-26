<template>
  <div class="w-full h-full overflow-auto border border-surface-border rounded">
    <!-- Loading State -->
    <div v-if="isLoading" class="w-full h-full flex items-center justify-center">
      <div class="text-center text-text-muted">
        <div class="animate-spin text-xl">⏳</div>
        <div class="text-xs mt-1">Carregando...</div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="w-full h-full flex items-center justify-center bg-red-50">
      <div class="text-center text-status-error p-2">
        <div class="text-xl">⚠️</div>
        <div class="text-xs mt-1">{{ error }}</div>
      </div>
    </div>

    <!-- Table -->
    <table v-else class="w-full text-sm">
      <!-- Header -->
      <thead v-if="element.properties.showHeader">
        <tr :style="headerRowStyle">
          <th
            v-for="col in visibleColumns"
            :key="col.id"
            class="px-3 py-2 text-left"
            :style="{ width: col.width === 'auto' ? 'auto' : `${col.width}px`, textAlign: col.align }"
          >
            {{ col.header }}
          </th>
        </tr>
      </thead>
      <!-- Body -->
      <tbody>
        <tr
          v-for="(row, index) in displayData"
          :key="index"
          :style="getRowStyle(index)"
        >
          <td
            v-for="col in visibleColumns"
            :key="col.id"
            class="px-3 py-2"
            :style="{ textAlign: col.align }"
          >
            {{ formatValue(row[col.field]) }}
          </td>
        </tr>
        <tr v-if="visibleColumns.length === 0">
          <td class="px-3 py-4 text-center text-text-muted">
            Configure as colunas nas propriedades
          </td>
        </tr>
        <tr v-else-if="displayData.length === 0 && !isLoading">
          <td :colspan="visibleColumns.length" class="px-3 py-4 text-center text-text-muted">
            {{ element.dataSource.sqlQuery ? 'Nenhum dado encontrado' : 'Configure a query SQL' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { ListElement } from '~/types/report'

const props = defineProps<{
  element: ListElement
  previewMode?: boolean
}>()

const { executeQuery, isLoading, error } = useQueryExecutor()
const queryData = ref<Record<string, unknown>[]>([])

const visibleColumns = computed(() =>
  props.element.properties.columns.filter(col => col.visible)
)

const headerRowStyle = computed(() => ({
  backgroundColor: props.element.properties.headerStyle.backgroundColor,
  color: props.element.properties.headerStyle.color,
  fontWeight: props.element.properties.headerStyle.fontWeight,
  fontSize: `${props.element.properties.headerStyle.fontSize}px`,
}))

const getRowStyle = (index: number) => ({
  backgroundColor: index % 2 === 1
    ? props.element.properties.rowStyle.alternateBackgroundColor
    : props.element.properties.rowStyle.backgroundColor,
  color: props.element.properties.rowStyle.color,
  fontSize: `${props.element.properties.rowStyle.fontSize}px`,
  borderBottom: props.element.properties.borderStyle !== 'none'
    ? `1px solid ${props.element.properties.borderColor}`
    : undefined,
})

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'number') return value.toLocaleString('pt-BR')
  return String(value)
}

// Sample data for preview when no query
const sampleData = computed(() => {
  if (visibleColumns.value.length === 0) return []
  return Array.from({ length: 3 }, (_, i) => {
    const row: Record<string, string> = {}
    visibleColumns.value.forEach(col => {
      row[col.field] = `Exemplo ${i + 1}`
    })
    return row
  })
})

// Use real data if available, otherwise sample data
const displayData = computed(() => {
  if (queryData.value.length > 0) return queryData.value
  if (!props.element.dataSource.sqlQuery) return sampleData.value
  return []
})

// Load data when query changes
const loadData = async () => {
  const { sqlQuery } = props.element.dataSource
  if (!sqlQuery) {
    queryData.value = []
    return
  }

  const result = await executeQuery(sqlQuery)
  if (result) {
    queryData.value = result.rows
  } else {
    queryData.value = []
  }
}

// Watch for changes and reload
watch(
  () => props.element.dataSource.sqlQuery,
  () => {
    if (props.previewMode !== false) {
      loadData()
    }
  },
  { immediate: true }
)
</script>
