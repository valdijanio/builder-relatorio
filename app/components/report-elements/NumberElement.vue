<template>
  <div
    class="flex items-center px-2 w-full h-full"
    :style="numberStyle"
  >
    <!-- Loading State -->
    <span v-if="isLoading" class="animate-spin">⏳</span>

    <!-- Error State -->
    <span v-else-if="error" class="text-status-error text-xs" :title="error">⚠️ Erro</span>

    <!-- Value -->
    <span v-else>{{ formattedValue }}</span>
  </div>
</template>

<script setup lang="ts">
import type { NumberElement } from '~/types/report'

const props = defineProps<{
  element: NumberElement
  previewMode?: boolean
}>()

// Use datasets instead of direct query execution
const {
  getDatasetData,
  isDatasetLoading,
  getDatasetError,
  executeDataset,
} = useDatasets()

// Computed values from dataset
const datasetData = computed(() => {
  if (!props.element.dataBinding?.datasetId) return []
  return getDatasetData(props.element.dataBinding.datasetId)
})

const isLoading = computed(() => {
  if (!props.element.dataBinding?.datasetId) return false
  return isDatasetLoading(props.element.dataBinding.datasetId)
})

const error = computed(() => {
  if (!props.element.dataBinding?.datasetId) return null
  return getDatasetError(props.element.dataBinding.datasetId)
})

const numberStyle = computed(() => ({
  fontFamily: props.element.properties.fontFamily,
  fontSize: `${props.element.properties.fontSize}px`,
  fontWeight: props.element.properties.fontWeight,
  color: props.element.properties.color,
  textAlign: props.element.properties.textAlign,
  justifyContent: props.element.properties.textAlign === 'right' ? 'flex-end' :
                   props.element.properties.textAlign === 'center' ? 'center' : 'flex-start',
}))

// Calculate value with aggregation
const calculatedValue = computed(() => {
  const { field, aggregation = 'first' } = props.element.dataBinding || {}
  if (!field || datasetData.value.length === 0) return null

  const values = datasetData.value
    .map(row => Number(row[field]) || 0)
    .filter(v => !isNaN(v))

  if (values.length === 0) return null

  switch (aggregation) {
    case 'sum': return values.reduce((a, b) => a + b, 0)
    case 'avg': return values.reduce((a, b) => a + b, 0) / values.length
    case 'count': return values.length
    case 'min': return Math.min(...values)
    case 'max': return Math.max(...values)
    case 'first':
    default: return values[0]
  }
})

// Use calculated value if available, otherwise use static value
const displayValue = computed(() => {
  if (calculatedValue.value !== null) return calculatedValue.value
  return props.element.properties.value ?? 0
})

const formattedValue = computed(() => {
  const value = displayValue.value
  const { prefix, suffix, decimalPlaces, thousandsSeparator, decimalSeparator } = props.element.properties

  let formatted = value.toFixed(decimalPlaces)

  // Apply thousands separator
  const parts = formatted.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
  formatted = parts.join(decimalSeparator)

  return `${prefix || ''}${formatted}${suffix || ''}`
})

// Auto-load dataset when in preview mode
watch(
  () => props.element.dataBinding?.datasetId,
  async (datasetId) => {
    if (props.previewMode !== false && datasetId && datasetData.value.length === 0) {
      await executeDataset(datasetId)
    }
  },
  { immediate: true }
)
</script>
