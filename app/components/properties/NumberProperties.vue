<template>
  <div>
    <!-- Value -->
    <div class="property-group">
      <div class="property-group-title">Valor</div>
      <div class="space-y-3">
        <div>
          <label class="label">Valor (preview)</label>
          <input
            type="number"
            class="input"
            step="0.01"
            :value="element.properties.value"
            @input="updateProperty('value', parseFloat(($event.target as HTMLInputElement).value) || 0)"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Prefixo</label>
            <input
              type="text"
              class="input"
              placeholder="R$"
              :value="element.properties.prefix"
              @input="updateProperty('prefix', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div>
            <label class="label">Sufixo</label>
            <input
              type="text"
              class="input"
              placeholder="%"
              :value="element.properties.suffix"
              @input="updateProperty('suffix', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Formatting -->
    <div class="property-group">
      <div class="property-group-title">Formatação</div>
      <div class="space-y-3">
        <div>
          <label class="label">Casas decimais</label>
          <input
            type="number"
            class="input"
            min="0"
            max="10"
            :value="element.properties.decimalPlaces"
            @input="updateProperty('decimalPlaces', parseInt(($event.target as HTMLInputElement).value) || 0)"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Sep. Milhares</label>
            <input
              type="text"
              class="input"
              maxlength="1"
              :value="element.properties.thousandsSeparator"
              @input="updateProperty('thousandsSeparator', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div>
            <label class="label">Sep. Decimal</label>
            <input
              type="text"
              class="input"
              maxlength="1"
              :value="element.properties.decimalSeparator"
              @input="updateProperty('decimalSeparator', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Typography -->
    <div class="property-group">
      <div class="property-group-title">Tipografia</div>
      <div class="space-y-3">
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

        <div>
          <label class="label">Alinhamento</label>
          <div class="flex gap-1">
            <button
              v-for="align in ['left', 'center', 'right']"
              :key="align"
              class="flex-1 py-2 rounded border transition-colors"
              :class="element.properties.textAlign === align
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-text-secondary border-surface-border hover:border-accent'"
              @click="updateProperty('textAlign', align)"
            >
              {{ align === 'left' ? '◀' : align === 'center' ? '●' : '▶' }}
            </button>
          </div>
        </div>
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
            :value="element.dataBinding?.datasetId"
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

        <!-- Options when dataset is selected -->
        <template v-if="element.dataBinding?.datasetId">
          <!-- Field Selection -->
          <div>
            <label class="label">Campo</label>
            <select
              class="input"
              :value="element.dataBinding?.field"
              @change="updateDataBinding('field', ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Selecione um campo...</option>
              <option
                v-for="field in availableFields"
                :key="field"
                :value="field"
              >
                {{ field }}
              </option>
            </select>
          </div>

          <!-- Aggregation -->
          <div>
            <label class="label">Agregação</label>
            <select
              class="input"
              :value="element.dataBinding?.aggregation || 'first'"
              @change="updateDataBinding('aggregation', ($event.target as HTMLSelectElement).value)"
            >
              <option value="first">Primeiro valor</option>
              <option value="sum">Soma (SUM)</option>
              <option value="avg">Média (AVG)</option>
              <option value="count">Contagem (COUNT)</option>
              <option value="min">Mínimo (MIN)</option>
              <option value="max">Máximo (MAX)</option>
            </select>
          </div>

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

          <!-- Data Preview -->
          <div v-if="previewValue !== null" class="p-3 bg-green-50 border border-green-200 rounded">
            <div class="text-xs text-text-muted mb-1">Valor calculado:</div>
            <div class="text-lg font-medium text-text-primary">{{ formattedPreview }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NumberElement } from '~/types/report'

const props = defineProps<{
  element: NumberElement
}>()

const emit = defineEmits<{
  update: [updates: Partial<NumberElement>]
}>()

// Datasets
const {
  datasets,
  getDatasetData,
  getDatasetFields,
  isDatasetLoading,
  executeDataset,
} = useDatasets()

// Available fields from selected dataset
const availableFields = computed(() => {
  if (!props.element.dataBinding?.datasetId) return []
  return getDatasetFields(props.element.dataBinding.datasetId)
})

// Data from selected dataset
const datasetData = computed(() => {
  if (!props.element.dataBinding?.datasetId) return []
  return getDatasetData(props.element.dataBinding.datasetId)
})

// Calculate preview value with aggregation
const previewValue = computed(() => {
  const { field, aggregation = 'first' } = props.element.dataBinding || {}
  if (!field || datasetData.value.length === 0) return null

  const values = datasetData.value
    .map(row => Number(row[field]) || 0)
    .filter(v => !isNaN(v))

  if (values.length === 0) return null

  switch (aggregation) {
    case 'sum': return values.reduce((a, b) => a + b, 0)
    case 'avg': return values.reduce((a, b) => a + b, 0) / values.length
    case 'count': return values.length
    case 'min': return Math.min(...values)
    case 'max': return Math.max(...values)
    case 'first':
    default: return values[0]
  }
})

// Format preview value
const formattedPreview = computed(() => {
  if (previewValue.value === null) return '-'
  const { prefix, suffix, decimalPlaces, thousandsSeparator, decimalSeparator } = props.element.properties

  let formatted = previewValue.value.toFixed(decimalPlaces)
  const parts = formatted.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
  formatted = parts.join(decimalSeparator)

  return `${prefix || ''}${formatted}${suffix || ''}`
})

// Auto-load dataset when selected
watch(
  () => props.element.dataBinding?.datasetId,
  async (newId) => {
    if (newId && getDatasetData(newId).length === 0) {
      await executeDataset(newId)
    }
  },
  { immediate: true }
)

const updateProperty = (key: keyof NumberElement['properties'], value: any) => {
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
      datasetId: props.element.dataBinding?.datasetId || '',
      field: props.element.dataBinding?.field || '',
      aggregation: props.element.dataBinding?.aggregation || 'first',
      [key]: value,
    },
  })
}
</script>
