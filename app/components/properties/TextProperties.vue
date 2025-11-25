<template>
  <div>
    <!-- Text Content -->
    <div class="property-group">
      <div class="property-group-title">Conteúdo</div>
      <div>
        <label class="label">Texto</label>
        <input
          type="text"
          class="input"
          :value="element.properties.content"
          @input="updateProperty('content', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <!-- Typography -->
    <div class="property-group">
      <div class="property-group-title">Tipografia</div>
      <div class="space-y-3">
        <div>
          <label class="label">Fonte</label>
          <select
            class="input"
            :value="element.properties.fontFamily"
            @change="updateProperty('fontFamily', ($event.target as HTMLSelectElement).value)"
          >
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Tamanho</label>
            <input
              type="number"
              class="input"
              :value="element.properties.fontSize"
              @input="updateProperty('fontSize', parseInt(($event.target as HTMLInputElement).value) || 14)"
            />
          </div>
          <div>
            <label class="label">Cor</label>
            <input
              type="color"
              class="input h-10 p-1"
              :value="element.properties.color"
              @input="updateProperty('color', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Peso</label>
            <select
              class="input"
              :value="element.properties.fontWeight"
              @change="updateProperty('fontWeight', ($event.target as HTMLSelectElement).value)"
            >
              <option value="normal">Normal</option>
              <option value="bold">Negrito</option>
            </select>
          </div>
          <div>
            <label class="label">Estilo</label>
            <select
              class="input"
              :value="element.properties.fontStyle"
              @change="updateProperty('fontStyle', ($event.target as HTMLSelectElement).value)"
            >
              <option value="normal">Normal</option>
              <option value="italic">Itálico</option>
            </select>
          </div>
        </div>

        <div>
          <label class="label">Alinhamento</label>
          <div class="flex gap-1">
            <button
              v-for="align in ['left', 'center', 'right', 'justify']"
              :key="align"
              class="flex-1 py-2 rounded border transition-colors"
              :class="element.properties.textAlign === align
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-text-secondary border-surface-border hover:border-accent'"
              @click="updateProperty('textAlign', align)"
            >
              {{ alignIcon(align) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TextElement } from '~/types/report'

const props = defineProps<{
  element: TextElement
}>()

const emit = defineEmits<{
  update: [updates: Partial<TextElement>]
}>()

const updateProperty = (key: keyof TextElement['properties'], value: any) => {
  emit('update', {
    properties: {
      ...props.element.properties,
      [key]: value,
    },
  })
}

const alignIcon = (align: string) => {
  const icons: Record<string, string> = {
    left: '◀',
    center: '●',
    right: '▶',
    justify: '≡',
  }
  return icons[align] || align
}
</script>
