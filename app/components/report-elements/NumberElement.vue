<template>
  <div
    class="flex items-center px-2 w-full h-full"
    :style="numberStyle"
  >
    <!-- Loading State -->
    <span v-if="isLoading" class="animate-spin">⏳</span>

    <!-- Error State -->
    <span v-else-if="error" class="text-status-error text-xs">⚠️ Erro</span>

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

const { executeQuery, isLoading, error } = useQueryExecutor()
const queryValue = ref<number | null>(null)

const numberStyle = computed(() => ({
  fontFamily: props.element.properties.fontFamily,
  fontSize: `${props.element.properties.fontSize}px`,
  fontWeight: props.element.properties.fontWeight,
  color: props.element.properties.color,
  textAlign: props.element.properties.textAlign,
  justifyContent: props.element.properties.textAlign === 'right' ? 'flex-end' :
                   props.element.properties.textAlign === 'center' ? 'center' : 'flex-start',
}))

// Use query value if available, otherwise use static value
const displayValue = computed(() => {
  if (queryValue.value !== null) return queryValue.value
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

// Load data when query changes
const loadData = async () => {
  const sqlQuery = props.element.dataSource?.sqlQuery
  const field = props.element.dataSource?.field

  if (!sqlQuery || !field) {
    queryValue.value = null
    return
  }

  const result = await executeQuery(sqlQuery)
  if (result && result.rows.length > 0) {
    const value = result.rows[0][field]
    queryValue.value = typeof value === 'number' ? value : parseFloat(String(value)) || 0
  } else {
    queryValue.value = null
  }
}

// Watch for changes and reload
watch(
  () => [props.element.dataSource?.sqlQuery, props.element.dataSource?.field],
  () => {
    if (props.previewMode !== false && props.element.dataSource?.sqlQuery) {
      loadData()
    }
  },
  { immediate: true, deep: true }
)
</script>
