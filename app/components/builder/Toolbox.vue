<template>
  <div class="h-full flex flex-col">
    <!-- Tabs -->
    <div class="flex border-b border-surface-border">
      <button
        class="flex-1 px-3 py-2 text-sm font-medium transition-colors"
        :class="activeTab === 'elements'
          ? 'text-accent border-b-2 border-accent'
          : 'text-text-secondary hover:text-text-primary'"
        @click="activeTab = 'elements'"
      >
        Elementos
      </button>
      <button
        class="flex-1 px-3 py-2 text-sm font-medium transition-colors"
        :class="activeTab === 'datasets'
          ? 'text-accent border-b-2 border-accent'
          : 'text-text-secondary hover:text-text-primary'"
        @click="activeTab = 'datasets'"
      >
        Datasets
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-2">
      <!-- Elements Tab -->
      <div v-if="activeTab === 'elements'" class="space-y-1">
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

      <!-- Datasets Tab -->
      <div v-else class="space-y-2">
        <BuilderDatasetsPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toolboxItems, type ElementType } from '~/types/report'

const activeTab = ref<'elements' | 'datasets'>('elements')

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
