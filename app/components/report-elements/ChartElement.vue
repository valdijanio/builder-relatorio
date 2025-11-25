<template>
  <div class="w-full h-full flex items-center justify-center bg-surface-tertiary/50 rounded border border-surface-border">
    <div class="text-center text-text-muted">
      <div class="text-3xl mb-2">📊</div>
      <div class="text-sm font-medium">{{ chartTypeLabel }}</div>
      <div class="text-xs mt-1">{{ element.properties.title || 'Gráfico' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartElement } from '~/types/report'

const props = defineProps<{
  element: ChartElement
}>()

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
</script>
