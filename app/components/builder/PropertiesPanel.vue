<template>
  <div class="h-full">
    <div v-if="!selectedElement" class="p-4 text-center text-text-muted">
      <div class="text-4xl mb-3">👆</div>
      <p class="text-sm">Selecione um elemento no canvas para editar suas propriedades</p>
    </div>

    <template v-else>
      <!-- Element Type Header -->
      <div class="property-group">
        <div class="flex items-center gap-2 mb-3">
          <span class="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
            {{ elementIcon }}
          </span>
          <span class="font-medium text-text-primary">{{ elementLabel }}</span>
        </div>

        <!-- Delete Button -->
        <button
          class="w-full btn-secondary text-sm text-status-error hover:bg-red-50"
          @click="deleteElement(selectedElement.id)"
        >
          Excluir Elemento
        </button>
      </div>

      <!-- Position & Size -->
      <div class="property-group">
        <div class="property-group-title">Posição e Tamanho</div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">X</label>
            <input
              type="number"
              class="input"
              :value="selectedElement.position.x"
              @input="updatePosition('x', $event)"
            />
          </div>
          <div>
            <label class="label">Y</label>
            <input
              type="number"
              class="input"
              :value="selectedElement.position.y"
              @input="updatePosition('y', $event)"
            />
          </div>
          <div>
            <label class="label">Largura</label>
            <input
              type="number"
              class="input"
              :value="selectedElement.size.width"
              @input="updateSize('width', $event)"
            />
          </div>
          <div>
            <label class="label">Altura</label>
            <input
              type="number"
              class="input"
              :value="selectedElement.size.height"
              @input="updateSize('height', $event)"
            />
          </div>
        </div>
      </div>

      <!-- Type-specific properties -->
      <component
        :is="propertiesComponent"
        :element="selectedElement"
        @update="onPropertyUpdate"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ReportElement } from '~/types/report'

const { selectedElement, updateElement, updateElementPosition, updateElementSize, deleteElement } = useCanvas()

const elementIcon = computed(() => {
  if (!selectedElement.value) return ''
  const icons: Record<string, string> = {
    text: 'T',
    number: '#',
    list: '☰',
    chart: '📊',
  }
  return icons[selectedElement.value.type] || '?'
})

const elementLabel = computed(() => {
  if (!selectedElement.value) return ''
  const labels: Record<string, string> = {
    text: 'Texto',
    number: 'Número',
    list: 'Lista/Tabela',
    chart: 'Gráfico',
  }
  return labels[selectedElement.value.type] || 'Elemento'
})

const propertiesComponent = computed(() => {
  if (!selectedElement.value) return null
  switch (selectedElement.value.type) {
    case 'text':
      return resolveComponent('PropertiesTextProperties')
    case 'number':
      return resolveComponent('PropertiesNumberProperties')
    case 'list':
      return resolveComponent('PropertiesListProperties')
    case 'chart':
      return resolveComponent('PropertiesChartProperties')
    default:
      return null
  }
})

const updatePosition = (axis: 'x' | 'y', event: Event) => {
  if (!selectedElement.value) return
  const value = parseInt((event.target as HTMLInputElement).value) || 0
  updateElementPosition(selectedElement.value.id, {
    ...selectedElement.value.position,
    [axis]: value,
  })
}

const updateSize = (dimension: 'width' | 'height', event: Event) => {
  if (!selectedElement.value) return
  const value = parseInt((event.target as HTMLInputElement).value) || 50
  updateElementSize(selectedElement.value.id, {
    ...selectedElement.value.size,
    [dimension]: Math.max(dimension === 'width' ? 50 : 30, value),
  })
}

const onPropertyUpdate = (updates: Partial<ReportElement>) => {
  if (!selectedElement.value) return
  updateElement(selectedElement.value.id, updates)
}
</script>
