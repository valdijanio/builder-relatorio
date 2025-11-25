<template>
  <div
    ref="elementRef"
    class="canvas-element"
    :class="{ selected }"
    :style="elementStyle"
    @mousedown="onMouseDown"
    @click.stop="$emit('select')"
  >
    <!-- Element Content -->
    <component
      :is="elementComponent"
      :element="element"
      class="w-full h-full pointer-events-none"
    />

    <!-- Resize Handles (only when selected) -->
    <template v-if="selected">
      <div
        v-for="handle in resizeHandles"
        :key="handle.position"
        class="resize-handle"
        :style="handle.style"
        @mousedown.stop="onResizeStart($event, handle.position)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ReportElement } from '~/types/report'
import type { ResizeHandle } from '~/types/elements'

const props = defineProps<{
  element: ReportElement
  selected: boolean
  zoom: number
}>()

const emit = defineEmits<{
  select: []
  move: [position: { x: number; y: number }]
  resize: [size: { width: number; height: number }]
}>()

const elementRef = ref<HTMLElement>()

// Dynamic component based on element type
const elementComponent = computed(() => {
  switch (props.element.type) {
    case 'text':
      return resolveComponent('ReportElementsTextElement')
    case 'number':
      return resolveComponent('ReportElementsNumberElement')
    case 'list':
      return resolveComponent('ReportElementsListElement')
    case 'chart':
      return resolveComponent('ReportElementsChartElement')
    default:
      return 'div'
  }
})

const elementStyle = computed(() => ({
  left: `${props.element.position.x}px`,
  top: `${props.element.position.y}px`,
  width: `${props.element.size.width}px`,
  height: `${props.element.size.height}px`,
  backgroundColor: props.element.style.backgroundColor || 'transparent',
  borderRadius: props.element.style.borderRadius ? `${props.element.style.borderRadius}px` : undefined,
  opacity: props.element.style.opacity ?? 1,
}))

const resizeHandles = computed(() => [
  { position: 'top-left' as ResizeHandle, style: { top: '-5px', left: '-5px', cursor: 'nwse-resize' } },
  { position: 'top-right' as ResizeHandle, style: { top: '-5px', right: '-5px', cursor: 'nesw-resize' } },
  { position: 'bottom-left' as ResizeHandle, style: { bottom: '-5px', left: '-5px', cursor: 'nesw-resize' } },
  { position: 'bottom-right' as ResizeHandle, style: { bottom: '-5px', right: '-5px', cursor: 'nwse-resize' } },
  { position: 'top' as ResizeHandle, style: { top: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' } },
  { position: 'bottom' as ResizeHandle, style: { bottom: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' } },
  { position: 'left' as ResizeHandle, style: { top: '50%', left: '-5px', transform: 'translateY(-50%)', cursor: 'ew-resize' } },
  { position: 'right' as ResizeHandle, style: { top: '50%', right: '-5px', transform: 'translateY(-50%)', cursor: 'ew-resize' } },
])

// Drag handling
let isDragging = false
let dragStartPos = { x: 0, y: 0 }
let elementStartPos = { x: 0, y: 0 }

const onMouseDown = (event: MouseEvent) => {
  if (!props.selected) return

  isDragging = true
  dragStartPos = { x: event.clientX, y: event.clientY }
  elementStartPos = { ...props.element.position }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (event: MouseEvent) => {
  if (!isDragging) return

  const scale = props.zoom / 100
  const deltaX = (event.clientX - dragStartPos.x) / scale
  const deltaY = (event.clientY - dragStartPos.y) / scale

  emit('move', {
    x: Math.max(0, elementStartPos.x + deltaX),
    y: Math.max(0, elementStartPos.y + deltaY),
  })
}

const onMouseUp = () => {
  isDragging = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

// Resize handling
let isResizing = false
let resizeHandle: ResizeHandle | null = null
let resizeStartPos = { x: 0, y: 0 }
let elementStartSize = { width: 0, height: 0 }

const onResizeStart = (event: MouseEvent, handle: ResizeHandle) => {
  isResizing = true
  resizeHandle = handle
  resizeStartPos = { x: event.clientX, y: event.clientY }
  elementStartSize = { ...props.element.size }
  elementStartPos = { ...props.element.position }

  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

const onResizeMove = (event: MouseEvent) => {
  if (!isResizing || !resizeHandle) return

  const scale = props.zoom / 100
  const deltaX = (event.clientX - resizeStartPos.x) / scale
  const deltaY = (event.clientY - resizeStartPos.y) / scale

  let newWidth = elementStartSize.width
  let newHeight = elementStartSize.height
  let newX = elementStartPos.x
  let newY = elementStartPos.y

  if (resizeHandle.includes('right')) {
    newWidth = Math.max(50, elementStartSize.width + deltaX)
  }
  if (resizeHandle.includes('left')) {
    newWidth = Math.max(50, elementStartSize.width - deltaX)
    newX = elementStartPos.x + deltaX
  }
  if (resizeHandle.includes('bottom')) {
    newHeight = Math.max(30, elementStartSize.height + deltaY)
  }
  if (resizeHandle.includes('top')) {
    newHeight = Math.max(30, elementStartSize.height - deltaY)
    newY = elementStartPos.y + deltaY
  }

  emit('resize', { width: newWidth, height: newHeight })
  if (resizeHandle.includes('left') || resizeHandle.includes('top')) {
    emit('move', { x: Math.max(0, newX), y: Math.max(0, newY) })
  }
}

const onResizeEnd = () => {
  isResizing = false
  resizeHandle = null
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
})
</script>
