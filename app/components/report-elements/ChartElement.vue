<template>
  <div class="w-full h-full">
    <!-- Loading State -->
    <div v-if="isLoading" class="w-full h-full flex items-center justify-center bg-surface-tertiary/50 rounded border border-surface-border">
      <div class="text-center text-text-muted">
        <div class="text-2xl animate-spin mb-2">⏳</div>
        <div class="text-xs">Carregando dados...</div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="w-full h-full flex items-center justify-center bg-red-50 rounded border border-red-200">
      <div class="text-center text-status-error p-2">
        <div class="text-2xl mb-2">⚠️</div>
        <div class="text-xs">{{ error }}</div>
      </div>
    </div>

    <!-- Chart -->
    <VChart
      v-else-if="hasData"
      :option="chartOption"
      :autoresize="true"
      class="w-full h-full"
    />

    <!-- Placeholder -->
    <div v-else class="w-full h-full flex items-center justify-center bg-surface-tertiary/50 rounded border border-surface-border">
      <div class="text-center text-text-muted">
        <div class="text-3xl mb-2">{{ chartIcon }}</div>
        <div class="text-sm font-medium">{{ chartTypeLabel }}</div>
        <div class="text-xs mt-1">{{ element.properties.title || 'Configure a query SQL' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import type { ChartElement } from '~/types/report'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  element: ChartElement
  previewMode?: boolean
}>()

const { executeQuery, isLoading, error } = useQueryExecutor()
const chartData = ref<Record<string, unknown>[]>([])

const chartTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    bar: 'Gráfico de Barras',
    line: 'Gráfico de Linha',
    pie: 'Gráfico de Pizza',
    doughnut: 'Gráfico Rosca',
    area: 'Gráfico de Área',
  }
  return labels[props.element.properties.chartType] || 'Gráfico'
})

const chartIcon = computed(() => {
  const icons: Record<string, string> = {
    bar: '📊',
    line: '📈',
    pie: '🥧',
    doughnut: '🍩',
    area: '📉',
  }
  return icons[props.element.properties.chartType] || '📊'
})

const hasData = computed(() => chartData.value.length > 0)

const chartOption = computed<EChartsOption>(() => {
  const { chartType, title, showLegend, legendPosition, colors, animation } = props.element.properties
  const { labelField, valueFields } = props.element.dataSource

  if (!hasData.value || !labelField || valueFields.length === 0) {
    return {}
  }

  const labels = chartData.value.map(row => String(row[labelField] || ''))

  // Base option
  const option: EChartsOption = {
    animation,
    color: colors,
  }

  // Title
  if (title) {
    option.title = {
      text: title,
      left: 'center',
      textStyle: { fontSize: 14 },
    }
  }

  // Legend
  if (showLegend) {
    option.legend = {
      show: true,
      [legendPosition === 'left' || legendPosition === 'right' ? 'orient' : '']: 'vertical',
      [legendPosition]: legendPosition === 'top' || legendPosition === 'bottom' ? 'center' : 10,
      top: legendPosition === 'left' || legendPosition === 'right' ? 'middle' : undefined,
    }
  }

  // Chart-specific options
  if (chartType === 'pie' || chartType === 'doughnut') {
    const data = chartData.value.map(row => ({
      name: String(row[labelField] || ''),
      value: Number(row[valueFields[0]] || 0),
    }))

    option.tooltip = { trigger: 'item' }
    option.series = [{
      type: 'pie',
      radius: chartType === 'doughnut' ? ['40%', '70%'] : '70%',
      data,
      label: { show: true, formatter: '{b}: {c}' },
    }]
  } else {
    // Bar, Line, Area
    option.tooltip = { trigger: 'axis' }
    option.grid = {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: title ? '15%' : '10%',
      containLabel: true,
    }
    option.xAxis = {
      type: 'category',
      data: labels,
    }
    option.yAxis = {
      type: 'value',
    }

    option.series = valueFields.map((field, index) => ({
      name: field,
      type: chartType === 'area' ? 'line' : chartType as 'bar' | 'line',
      data: chartData.value.map(row => Number(row[field] || 0)),
      areaStyle: chartType === 'area' ? {} : undefined,
      itemStyle: { color: colors[index % colors.length] },
    }))
  }

  return option
})

// Load data when query changes
const loadData = async () => {
  const { sqlQuery } = props.element.dataSource
  if (!sqlQuery) {
    chartData.value = []
    return
  }

  const result = await executeQuery(sqlQuery)
  if (result) {
    chartData.value = result.rows
  } else {
    chartData.value = []
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
