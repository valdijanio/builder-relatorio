<template>
  <div class="w-full h-full overflow-auto border border-surface-border rounded">
    <table class="w-full text-sm">
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
      <!-- Body (sample data) -->
      <tbody>
        <tr
          v-for="(row, index) in sampleData"
          :key="index"
          :style="getRowStyle(index)"
        >
          <td
            v-for="col in visibleColumns"
            :key="col.id"
            class="px-3 py-2"
            :style="{ textAlign: col.align }"
          >
            {{ row[col.field] || '-' }}
          </td>
        </tr>
        <tr v-if="visibleColumns.length === 0">
          <td class="px-3 py-4 text-center text-text-muted">
            Configure as colunas nas propriedades
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
}>()

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

// Sample data for preview
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
</script>
