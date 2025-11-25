<template>
  <div class="space-y-1">
    <div
      v-for="item in toolboxItems"
      :key="item.type"
      class="toolbox-item"
      draggable="true"
      @dragstart="onDragStart($event, item.type)"
      @dragend="onDragEnd"
    >
      <span class="w-8 h-8 rounded-lg bg-surface-tertiary flex items-center justify-center text-lg">
        {{ item.icon }}
      </span>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-text-primary">{{ item.label }}</div>
        <div class="text-xs text-text-muted truncate">{{ item.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toolboxItems, type ElementType } from '~/types/report'

const emit = defineEmits<{
  dragStart: [type: ElementType]
  dragEnd: []
}>()

const onDragStart = (event: DragEvent, type: ElementType) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('elementType', type)
    event.dataTransfer.effectAllowed = 'copy'
  }
  emit('dragStart', type)
}

const onDragEnd = () => {
  emit('dragEnd')
}
</script>
