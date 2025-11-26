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

    <!-- Data Source -->
    <div class="property-group">
      <div class="property-group-title">Fonte de Dados</div>
      <div class="space-y-3">
        <div>
          <label class="label">Query SQL</label>
          <textarea
            class="input font-mono text-sm"
            rows="3"
            placeholder="SELECT SUM(valor) as total FROM vendas"
            :value="element.dataSource?.sqlQuery"
            @input="updateDataSource('sqlQuery', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <div>
          <label class="label">Campo</label>
          <input
            type="text"
            class="input"
            placeholder="total"
            :value="element.dataSource?.field"
            @input="updateDataSource('field', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <button
          class="btn-secondary text-sm w-full flex items-center justify-center gap-2"
          :disabled="isLoading || !element.dataSource?.sqlQuery"
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
              Resultado em {{ queryResult.executionTimeMs }}ms
            </span>
            <button class="text-xs text-accent hover:underline" @click="clearResult">
              Limpar
            </button>
          </div>
          <div v-if="queryResult.rows.length > 0" class="text-sm">
            <div class="font-medium text-text-primary">Campos disponíveis:</div>
            <div class="flex flex-wrap gap-1 mt-1">
              <span
                v-for="col in queryResult.columns"
                :key="col"
                class="px-2 py-0.5 bg-white rounded border border-surface-border text-xs cursor-pointer hover:border-accent"
                @click="updateDataSource('field', col)"
              >
                {{ col }}: {{ queryResult.rows[0][col] }}
              </span>
            </div>
            <div class="text-xs text-text-muted mt-2">
              Clique em um campo para selecioná-lo
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NumberElement } from '~/types/report'
import type { QueryResult } from '~/types/elements'

const props = defineProps<{
  element: NumberElement
}>()

const emit = defineEmits<{
  update: [updates: Partial<NumberElement>]
}>()

// Query executor
const { executeQuery, isLoading, error: queryError } = useQueryExecutor()
const queryResult = ref<QueryResult | null>(null)

const clearResult = () => {
  queryResult.value = null
}

const testQuery = async () => {
  if (!props.element.dataSource?.sqlQuery) return
  queryResult.value = null
  const result = await executeQuery(props.element.dataSource.sqlQuery)
  if (result) {
    queryResult.value = result
  }
}

const updateProperty = (key: keyof NumberElement['properties'], value: any) => {
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
      sqlQuery: props.element.dataSource?.sqlQuery || '',
      field: props.element.dataSource?.field || '',
      [key]: value,
    },
  })
}
</script>
