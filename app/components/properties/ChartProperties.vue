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

    <!-- Data Source -->
    <div class="property-group">
      <div class="property-group-title">Fonte de Dados</div>
      <div class="space-y-3">
        <div>
          <label class="label">Query SQL</label>
          <textarea
            class="input font-mono text-sm"
            rows="4"
            placeholder="SELECT categoria, SUM(valor) as total FROM vendas GROUP BY categoria"
            :value="element.dataSource.sqlQuery"
            @input="updateDataSource('sqlQuery', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <div>
          <label class="label">Campo de Label (eixo X)</label>
          <input
            type="text"
            class="input"
            placeholder="categoria"
            :value="element.dataSource.labelField"
            @input="updateDataSource('labelField', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div>
          <label class="label">Campos de Valor (separados por vírgula)</label>
          <input
            type="text"
            class="input"
            placeholder="total, quantidade"
            :value="element.dataSource.valueFields.join(', ')"
            @input="updateValueFields(($event.target as HTMLInputElement).value)"
          />
        </div>
        <button
          class="btn-secondary text-sm w-full flex items-center justify-center gap-2"
          :disabled="isLoading || !element.dataSource.sqlQuery"
          @click="testQuery"
        >
          <span v-if="isLoading" class="animate-spin">⏳</span>
          <span v-else>▶</span>
          {{ isLoading ? 'Executando...' : 'Testar Query' }}
        </button>

        <!-- Query Result Preview -->
        <div v-if="queryError" class="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-status-error">
          <div class="font-medium mb-1">Erro na query:</div>
          <div class="font-mono text-xs">{{ queryError }}</div>
        </div>

        <div v-if="queryResult && !queryError" class="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-text-muted">
              {{ queryResult.rowCount }} registro(s) em {{ queryResult.executionTimeMs }}ms
            </span>
            <button class="text-xs text-accent hover:underline" @click="clearResult">
              Limpar
            </button>
          </div>
          <div v-if="queryResult.rows.length > 0" class="text-sm">
            <div class="font-medium text-text-primary mb-1">Campos disponíveis:</div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="col in queryResult.columns"
                :key="col"
                class="px-2 py-0.5 bg-white rounded border border-surface-border text-xs cursor-pointer hover:border-accent"
                :class="{
                  'border-accent bg-accent/10': element.dataSource.labelField === col || element.dataSource.valueFields.includes(col)
                }"
                @click="selectField(col)"
              >
                {{ col }}
              </span>
            </div>
            <div class="text-xs text-text-muted mt-2">
              Clique para usar como Label (1º) ou Valor (2º+)
            </div>
          </div>
        </div>
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
import type { QueryResult } from '~/types/elements'

const props = defineProps<{
  element: ChartElement
}>()

const emit = defineEmits<{
  update: [updates: Partial<ChartElement>]
}>()

// Query executor
const { executeQuery, isLoading, error: queryError } = useQueryExecutor()
const queryResult = ref<QueryResult | null>(null)

const clearResult = () => {
  queryResult.value = null
}

const testQuery = async () => {
  if (!props.element.dataSource.sqlQuery) return
  queryResult.value = null
  const result = await executeQuery(props.element.dataSource.sqlQuery)
  if (result) {
    queryResult.value = result
  }
}

const selectField = (field: string) => {
  // Se não tem labelField, define como label
  if (!props.element.dataSource.labelField) {
    updateDataSource('labelField', field)
  } else if (props.element.dataSource.labelField === field) {
    // Se clicar no label atual, remove
    updateDataSource('labelField', '')
  } else if (props.element.dataSource.valueFields.includes(field)) {
    // Se já está nos valores, remove
    const newFields = props.element.dataSource.valueFields.filter(f => f !== field)
    emit('update', {
      dataSource: {
        ...props.element.dataSource,
        valueFields: newFields,
      },
    })
  } else {
    // Adiciona aos valores
    emit('update', {
      dataSource: {
        ...props.element.dataSource,
        valueFields: [...props.element.dataSource.valueFields, field],
      },
    })
  }
}

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

const updateDataSource = (key: string, value: any) => {
  emit('update', {
    dataSource: {
      ...props.element.dataSource,
      [key]: value,
    },
  })
}

const updateValueFields = (value: string) => {
  const fields = value.split(',').map(f => f.trim()).filter(Boolean)
  emit('update', {
    dataSource: {
      ...props.element.dataSource,
      valueFields: fields,
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
