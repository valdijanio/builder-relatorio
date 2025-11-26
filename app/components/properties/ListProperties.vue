<template>
  <div>
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
          <div>
            <label class="label">Limite de registros</label>
            <input
              type="number"
              class="input"
              min="1"
              max="1000"
              :value="element.dataBinding?.limit"
              @input="updateDataBinding('limit', parseInt(($event.target as HTMLInputElement).value) || 100)"
            />
          </div>

          <!-- Execute Dataset Button -->
          <button
            class="btn-secondary text-sm w-full flex items-center justify-center gap-2"
            :disabled="isDatasetLoading(element.dataBinding?.datasetId)"
            @click="executeDataset(element.dataBinding?.datasetId)"
          >
            <span v-if="isDatasetLoading(element.dataBinding?.datasetId)" class="animate-spin">⏳</span>
            <span v-else>▶</span>
            Atualizar Dados
          </button>

          <!-- Data Preview -->
          <div v-if="datasetData.length > 0" class="max-h-48 overflow-auto border border-surface-border rounded">
            <table class="w-full text-xs">
              <thead class="bg-surface-secondary sticky top-0">
                <tr>
                  <th
                    v-for="col in availableFields"
                    :key="col"
                    class="px-2 py-1 text-left font-medium text-text-secondary border-b border-surface-border"
                  >
                    {{ col }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in datasetData.slice(0, 5)"
                  :key="idx"
                  class="border-b border-surface-border last:border-0"
                >
                  <td
                    v-for="col in availableFields"
                    :key="col"
                    class="px-2 py-1 text-text-primary"
                  >
                    {{ row[col] ?? '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="datasetData.length > 5" class="p-2 text-center text-xs text-text-muted bg-surface-secondary">
              Mostrando 5 de {{ datasetData.length }} registros
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Columns -->
    <div class="property-group">
      <div class="property-group-title flex items-center justify-between">
        <span>Colunas</span>
        <div class="flex gap-2">
          <button
            v-if="availableFields.length > 0"
            class="text-accent text-xs hover:underline"
            @click="autoGenerateColumns"
          >
            Auto-gerar
          </button>
          <button class="text-accent text-xs hover:underline" @click="addColumn">
            + Adicionar
          </button>
        </div>
      </div>
      <div class="space-y-2">
        <div
          v-for="(col, index) in element.properties.columns"
          :key="col.id"
          class="p-2 bg-surface-secondary rounded border border-surface-border"
        >
          <div class="flex items-center justify-between mb-2">
            <input
              type="text"
              class="input py-1 text-sm flex-1"
              placeholder="Cabeçalho"
              :value="col.header"
              @input="updateColumn(index, 'header', ($event.target as HTMLInputElement).value)"
            />
            <button
              class="ml-2 text-status-error hover:bg-red-50 p-1 rounded"
              @click="removeColumn(index)"
            >
              ✕
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <select
              class="input py-1 text-sm"
              :value="col.field"
              @change="updateColumn(index, 'field', ($event.target as HTMLSelectElement).value)"
            >
              <option value="">Selecione campo...</option>
              <option
                v-for="field in availableFields"
                :key="field"
                :value="field"
              >
                {{ field }}
              </option>
            </select>
            <select
              class="input py-1 text-sm"
              :value="col.align"
              @change="updateColumn(index, 'align', ($event.target as HTMLSelectElement).value)"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </div>
        </div>
        <p v-if="element.properties.columns.length === 0" class="text-sm text-text-muted text-center py-2">
          Nenhuma coluna configurada
        </p>
      </div>
    </div>

    <!-- Style -->
    <div class="property-group">
      <div class="property-group-title">Estilo</div>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="label mb-0">Mostrar cabeçalho</label>
          <input
            type="checkbox"
            class="w-4 h-4 accent-accent"
            :checked="element.properties.showHeader"
            @change="updateProperty('showHeader', ($event.target as HTMLInputElement).checked)"
          />
        </div>
        <div>
          <label class="label">Bordas</label>
          <select
            class="input"
            :value="element.properties.borderStyle"
            @change="updateProperty('borderStyle', ($event.target as HTMLSelectElement).value)"
          >
            <option value="none">Sem bordas</option>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="full">Completa</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Cor Header</label>
            <input
              type="color"
              class="input h-10 p-1"
              :value="element.properties.headerStyle.backgroundColor"
              @input="updateHeaderStyle('backgroundColor', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div>
            <label class="label">Cor Alternada</label>
            <input
              type="color"
              class="input h-10 p-1"
              :value="element.properties.rowStyle.alternateBackgroundColor"
              @input="updateRowStyle('alternateBackgroundColor', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { ListElement, TableColumn } from '~/types/report'

const props = defineProps<{
  element: ListElement
}>()

const emit = defineEmits<{
  update: [updates: Partial<ListElement>]
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

const updateProperty = (key: keyof ListElement['properties'], value: any) => {
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
      orderBy: props.element.dataBinding?.orderBy,
      limit: props.element.dataBinding?.limit || 100,
      [key]: value,
    },
  })
}

const updateHeaderStyle = (key: string, value: any) => {
  emit('update', {
    properties: {
      ...props.element.properties,
      headerStyle: {
        ...props.element.properties.headerStyle,
        [key]: value,
      },
    },
  })
}

const updateRowStyle = (key: string, value: any) => {
  emit('update', {
    properties: {
      ...props.element.properties,
      rowStyle: {
        ...props.element.properties.rowStyle,
        [key]: value,
      },
    },
  })
}

const addColumn = () => {
  const newColumn: TableColumn = {
    id: uuidv4(),
    field: '',
    header: 'Nova Coluna',
    width: 'auto',
    align: 'left',
    visible: true,
  }
  emit('update', {
    properties: {
      ...props.element.properties,
      columns: [...props.element.properties.columns, newColumn],
    },
  })
}

const autoGenerateColumns = () => {
  const columns: TableColumn[] = availableFields.value.map((field) => ({
    id: uuidv4(),
    field,
    header: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' '),
    width: 'auto',
    align: 'left',
    visible: true,
  }))
  emit('update', {
    properties: {
      ...props.element.properties,
      columns,
    },
  })
}

const removeColumn = (index: number) => {
  const columns = [...props.element.properties.columns]
  columns.splice(index, 1)
  emit('update', {
    properties: {
      ...props.element.properties,
      columns,
    },
  })
}

const updateColumn = (index: number, key: keyof TableColumn, value: any) => {
  const columns = [...props.element.properties.columns]
  columns[index] = { ...columns[index], [key]: value }
  emit('update', {
    properties: {
      ...props.element.properties,
      columns,
    },
  })
}
</script>
