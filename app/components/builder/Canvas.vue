<template>
  <div
    ref="canvasContainer"
    class="relative w-full h-full p-8 overflow-auto"
    @click="onCanvasClick"
    @dragover.prevent="onDragOver"
    @drop="onDrop"
  >
    <!-- Paper/Canvas Area -->
    <div
      ref="canvasArea"
      class="relative bg-white shadow-canvas mx-auto"
      :style="canvasStyle"
    >
      <!-- Grid -->
      <div
        v-if="showGrid"
        class="absolute inset-0 pointer-events-none"
        :style="gridStyle"
      />

      <!-- Elements -->
      <CanvasElement
        v-for="element in elements"
        :key="element.id"
        :element="element"
        :selected="element.id === selectedElementId"
        :zoom="zoom"
        @select="selectElement(element.id)"
        @move="(pos) => updateElementPosition(element.id, pos)"
        @resize="(size) => updateElementSize(element.id, size)"
      />

      <!-- Drop indicator -->
      <div
        v-if="isDragging"
        class="absolute border-2 border-dashed border-accent rounded pointer-events-none transition-all"
        :style="dropIndicatorStyle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ElementType } from '~/types/report'

const {
  elements,
  selectedElementId,
  zoom,
  gridSize,
  showGrid,
  addElement,
  selectElement,
  clearSelection,
  updateElementPosition,
  updateElementSize,
} = useCanvas()

const canvasContainer = ref<HTMLElement>()
const canvasArea = ref<HTMLElement>()

// Canvas dimensions (A4 in pixels at 96 DPI)
const canvasWidth = 794 // ~210mm
const canvasHeight = 1123 // ~297mm

const isDragging = ref(false)
const dropPosition = ref({ x: 0, y: 0 })

const canvasStyle = computed(() => ({
  width: `${canvasWidth * (zoom.value / 100)}px`,
  height: `${canvasHeight * (zoom.value / 100)}px`,
  transform: `scale(${zoom.value / 100})`,
  transformOrigin: 'top left',
}))

const gridStyle = computed(() => ({
  backgroundImage: `
    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
  `,
  backgroundSize: `${gridSize.value}px ${gridSize.value}px`,
}))

const dropIndicatorStyle = computed(() => ({
  left: `${dropPosition.value.x}px`,
  top: `${dropPosition.value.y}px`,
  width: '100px',
  height: '30px',
}))

const onCanvasClick = (event: MouseEvent) => {
  // Only clear selection if clicking directly on canvas (not on elements)
  if (event.target === canvasArea.value || event.target === canvasContainer.value) {
    clearSelection()
  }
}

const onDragOver = (event: DragEvent) => {
  if (!canvasArea.value) return

  const rect = canvasArea.value.getBoundingClientRect()
  const scale = zoom.value / 100

  dropPosition.value = {
    x: (event.clientX - rect.left) / scale,
    y: (event.clientY - rect.top) / scale,
  }

  isDragging.value = true
}

const onDrop = (event: DragEvent) => {
  isDragging.value = false

  const elementType = event.dataTransfer?.getData('elementType') as ElementType
  if (!elementType || !canvasArea.value) return

  const rect = canvasArea.value.getBoundingClientRect()
  const scale = zoom.value / 100

  const position = {
    x: (event.clientX - rect.left) / scale,
    y: (event.clientY - rect.top) / scale,
  }

  addElement(elementType, position)
}
</script>
