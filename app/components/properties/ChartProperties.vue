<template>
  <div>
    <!-- Chart Type -->
    <div class="property-group">
      <div class="property-group-title">Tipo de Gráfico</div>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="type in chartTypes"
          :key="type.value"
          class="p-3 rounded border text-center transition-colors"
          :class="element.properties.chartType === type.value
            ? 'bg-accent text-white border-accent'
            : 'bg-white text-text-secondary border-surface-border hover:border-accent'"
          @click="updateProperty('chartType', type.value)"
        >
          <div class="text-xl mb-1">{{ type.icon }}</div>
          <div class="text-xs">{{ type.label }}</div>
        </button>
      </div>
    </div>

    <!-- Data Binding -->
    <div class="property-group">
      <div class="property-group-title">Fonte de Dados</div>
      <div class="space-y-3">
        <!-- Dataset Selection -->
        <div>
          <label class="label">Dataset</label>
          <select
            class="input"
            :value="element.dataBinding.datasetId"
            @change="updateDataBinding('datasetId', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Selecione um dataset...</option>
            <option
              v-for="ds in datasets"
              :key="ds.id"
              :value="ds.id"
            >
              {{ ds.name }}
            </option>
          </select>
          <p v-if="datasets.length === 0" class="text-xs text-text-muted mt-1">
            Crie um dataset na aba "Datasets" primeiro
          </p>
        </div>

        <!-- Field Selection (only if dataset selected) -->
        <template v-if="element.dataBinding.datasetId">
          <!-- Loading State -->
          <div v-if="isDatasetLoading(element.dataBinding.datasetId)" class="text-center py-4 text-text-muted">
            <span class="animate-spin inline-block">⏳</span>
            Carregando campos...
          </div>

          <!-- Error State -->
          <div
            v-else-if="getDatasetError(element.dataBinding.datasetId)"
            class="p-3 bg-red-50 border border-red-200 rounded text-sm"
          >
            <div class="text-status-error">{{ getDatasetError(element.dataBinding.datasetId) }}</div>
            <button class="btn-secondary text-xs mt-2" @click="executeDataset(element.dataBinding.datasetId)">
              Tentar novamente
            </button>
          </div>

          <!-- Fields Selection -->
          <template v-else>
            <!-- Label Field -->
            <div>
              <label class="label">Campo de Label (eixo X / fatias)</label>
              <select
                class="input"
                :value="element.dataBinding.labelField"
                @change="updateDataBinding('labelField', ($event.target as HTMLSelectElement).value)"
              >
                <option value="">Selecione...</option>
                <option
                  v-for="field in availableFields"
                  :key="field"
                  :value="field"
                >
                  {{ field }}
                </option>
              </select>
            </div>

            <!-- Value Fields -->
            <div>
              <label class="label">Campos de Valor</label>
              <div class="space-y-2">
                <div
                  v-for="(field, index) in element.dataBinding.valueFields"
                  :key="index"
                  class="flex items-center gap-2"
                >
                  <select
                    class="input flex-1"
                    :value="field"
                    @change="updateValueField(index, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">Selecione...</option>
                    <option
                      v-for="f in availableFields"
                      :key="f"
                      :value="f"
                    >
                      {{ f }}
                    </option>
                  </select>
                  <button
                    class="text-status-error hover:text-red-700"
                    @click="removeValueField(index)"
                  >
                    ✕
                  </button>
                </div>
                <button
                  class="btn-secondary text-xs w-full"
                  @click="addValueField"
                >
                  + Adicionar Campo
                </button>
              </div>
            </div>

            <!-- Preview Data Info -->
            <div v-if="datasetData.length > 0" class="p-2 bg-surface-tertiary rounded text-xs text-text-muted">
              {{ datasetData.length }} registros disponíveis
            </div>
          </template>

          <!-- Execute Dataset Button -->
          <button
            class="btn-secondary text-sm w-full flex items-center justify-center gap-2"
            :disabled="isDatasetLoading(element.dataBinding.datasetId)"
            @click="executeDataset(element.dataBinding.datasetId)"
          >
            <span v-if="isDatasetLoading(element.dataBinding.datasetId)" class="animate-spin">⏳</span>
            <span v-else>▶</span>
            Atualizar Dados
          </button>
        </template>
      </div>
    </div>

    <!-- Appearance -->
    <div class="property-group">
      <div class="property-group-title">Aparência</div>
      <div class="space-y-3">
        <div>
          <label class="label">Título</label>
          <input
            type="text"
            class="input"
            placeholder="Título do gráfico"
            :value="element.properties.title"
            @input="updateProperty('title', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="flex items-center justify-between">
          <label class="label mb-0">Mostrar legenda</label>
          <input
            type="checkbox"
            class="w-4 h-4 accent-accent"
            :checked="element.properties.showLegend"
            @change="updateProperty('showLegend', ($event.target as HTMLInputElement).checked)"
          />
        </div>
        <div v-if="element.properties.showLegend">
          <label class="label">Posição da legenda</label>
          <select
            class="input"
            :value="element.properties.legendPosition"
            @change="updateProperty('legendPosition', ($event.target as HTMLSelectElement).value)"
          >
            <option value="top">Topo</option>
            <option value="bottom">Rodapé</option>
            <option value="left">Esquerda</option>
            <option value="right">Direita</option>
          </select>
        </div>
        <div class="flex items-center justify-between">
          <label class="label mb-0">Animação</label>
          <input
            type="checkbox"
            class="w-4 h-4 accent-accent"
            :checked="element.properties.animation"
            @change="updateProperty('animation', ($event.target as HTMLInputElement).checked)"
          />
        </div>
      </div>
    </div>

    <!-- Colors -->
    <div class="property-group">
      <div class="property-group-title">Cores</div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(color, index) in element.properties.colors"
          :key="index"
          class="relative"
        >
          <input
            type="color"
            class="w-10 h-10 rounded cursor-pointer border border-surface-border"
            :value="color"
            @input="updateColor(index, ($event.target as HTMLInputElement).value)"
          />
        </div>
        <button
          class="w-10 h-10 rounded border border-dashed border-surface-border text-text-muted hover:border-accent hover:text-accent transition-colors"
          @click="addColor"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartElement } from '~/types/report'

const props = defineProps<{
  element: ChartElement
}>()

const emit = defineEmits<{
  update: [updates: Partial<ChartElement>]
}>()

// Datasets
const {
  datasets,
  getDatasetData,
  getDatasetFields,
  isDatasetLoading,
  getDatasetError,
  executeDataset,
} = useDatasets()

// Available fields from selected dataset
const availableFields = computed(() => {
  if (!props.element.dataBinding.datasetId) return []
  return getDatasetFields(props.element.dataBinding.datasetId)
})

// Data from selected dataset
const datasetData = computed(() => {
  if (!props.element.dataBinding.datasetId) return []
  return getDatasetData(props.element.dataBinding.datasetId)
})

// Auto-load dataset when selected
watch(
  () => props.element.dataBinding.datasetId,
  async (newId) => {
    if (newId && getDatasetData(newId).length === 0) {
      await executeDataset(newId)
    }
  },
  { immediate: true }
)

const chartTypes = [
  { value: 'bar', label: 'Barras', icon: '📊' },
  { value: 'line', label: 'Linha', icon: '📈' },
  { value: 'pie', label: 'Pizza', icon: '🥧' },
  { value: 'doughnut', label: 'Rosca', icon: '🍩' },
  { value: 'area', label: 'Área', icon: '📉' },
]

const updateProperty = (key: keyof ChartElement['properties'], value: any) => {
  emit('update', {
    properties: {
      ...props.element.properties,
      [key]: value,
    },
  })
}

const updateDataBinding = (key: string, value: any) => {
  emit('update', {
    dataBinding: {
      ...props.element.dataBinding,
      [key]: value,
    },
  })
}

const addValueField = () => {
  emit('update', {
    dataBinding: {
      ...props.element.dataBinding,
      valueFields: [...props.element.dataBinding.valueFields, ''],
    },
  })
}

const updateValueField = (index: number, value: string) => {
  const newFields = [...props.element.dataBinding.valueFields]
  newFields[index] = value
  emit('update', {
    dataBinding: {
      ...props.element.dataBinding,
      valueFields: newFields,
    },
  })
}

const removeValueField = (index: number) => {
  const newFields = props.element.dataBinding.valueFields.filter((_, i) => i !== index)
  emit('update', {
    dataBinding: {
      ...props.element.dataBinding,
      valueFields: newFields,
    },
  })
}

const updateColor = (index: number, value: string) => {
  const colors = [...props.element.properties.colors]
  colors[index] = value
  emit('update', {
    properties: {
      ...props.element.properties,
      colors,
    },
  })
}

const addColor = () => {
  emit('update', {
    properties: {
      ...props.element.properties,
      colors: [...props.element.properties.colors, '#6b7280'],
    },
  })
}
</script>
