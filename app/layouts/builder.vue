<template>
  <div class="h-screen flex flex-col overflow-hidden bg-surface-secondary">
    <!-- Top Toolbar -->
    <header class="h-14 bg-white border-b border-surface-border flex items-center px-4 shrink-0">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="font-semibold text-text-primary hover:text-accent transition-colors">
          Report Builder
        </NuxtLink>
        <span class="text-text-muted">/</span>
        <span class="text-text-secondary">{{ reportTitle || 'Novo Relatório' }}</span>
      </div>

      <!-- Center Toolbar -->
      <div class="flex-1 flex items-center justify-center gap-1">
        <!-- Undo/Redo -->
        <div class="flex items-center gap-1 px-2 border-r border-surface-border">
          <button
            class="toolbar-btn"
            :disabled="!canUndo"
            title="Desfazer (Ctrl+Z)"
            @click="undo"
          >
            <span class="text-lg">↩</span>
          </button>
          <button
            class="toolbar-btn"
            :disabled="!canRedo"
            title="Refazer (Ctrl+Y)"
            @click="redo"
          >
            <span class="text-lg">↪</span>
          </button>
        </div>

        <!-- Zoom -->
        <div class="flex items-center gap-2 px-2 border-r border-surface-border">
          <button
            class="toolbar-btn"
            :disabled="zoom <= 25"
            title="Diminuir zoom"
            @click="zoomOut"
          >
            <span class="text-lg">−</span>
          </button>
          <span class="text-sm text-text-secondary w-12 text-center">{{ zoom }}%</span>
          <button
            class="toolbar-btn"
            :disabled="zoom >= 200"
            title="Aumentar zoom"
            @click="zoomIn"
          >
            <span class="text-lg">+</span>
          </button>
          <button
            class="toolbar-btn text-xs"
            title="Resetar zoom"
            @click="resetZoom"
          >
            100%
          </button>
        </div>

        <!-- Grid -->
        <div class="flex items-center gap-2 px-2">
          <button
            class="toolbar-btn"
            :class="{ 'bg-accent/10 text-accent': showGrid }"
            title="Mostrar/ocultar grid"
            @click="showGrid = !showGrid"
          >
            <span class="text-lg">#</span>
          </button>
          <button
            class="toolbar-btn"
            :class="{ 'bg-accent/10 text-accent': snapToGrid }"
            title="Snap to grid"
            @click="snapToGrid = !snapToGrid"
          >
            <span class="text-lg">⊞</span>
          </button>
        </div>

        <slot name="toolbar" />
      </div>

      <div class="flex items-center gap-3">
        <button class="btn-secondary text-sm" @click="$emit('preview')">
          Preview
        </button>
        <button class="btn-primary text-sm" @click="$emit('save')">
          Salvar
        </button>
      </div>
    </header>

    <!-- Main Content: 3 columns -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left: Toolbox -->
      <aside class="w-60 bg-sidebar-bg border-r border-surface-border flex flex-col shrink-0">
        <div class="panel-header">
          Componentes
        </div>
        <div class="flex-1 overflow-y-auto p-3">
          <slot name="toolbox" />
        </div>
      </aside>

      <!-- Center: Canvas -->
      <main class="flex-1 overflow-auto bg-canvas-bg">
        <slot name="canvas" />
      </main>

      <!-- Right: Properties -->
      <aside class="w-72 bg-white border-l border-surface-border flex flex-col shrink-0">
        <div class="panel-header">
          Propriedades
        </div>
        <div class="flex-1 overflow-y-auto">
          <slot name="properties" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reportTitle?: string
}>()

defineEmits<{
  save: []
  preview: []
}>()

const { zoom, showGrid, snapToGrid, canUndo, canRedo, undo, redo } = useCanvas()

const zoomIn = () => {
  zoom.value = Math.min(200, zoom.value + 25)
}

const zoomOut = () => {
  zoom.value = Math.max(25, zoom.value - 25)
}

const resetZoom = () => {
  zoom.value = 100
}

// Keyboard shortcuts
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    // Undo: Ctrl+Z
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    }
    // Redo: Ctrl+Y or Ctrl+Shift+Z
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault()
      redo()
    }
  }

  window.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<style scoped>
.toolbar-btn {
  @apply w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed;
}
</style>
