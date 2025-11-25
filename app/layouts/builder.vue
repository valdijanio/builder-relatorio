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

      <div class="flex-1 flex items-center justify-center gap-2">
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
</script>
