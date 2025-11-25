<template>
  <div>
    <!-- Data Source -->
    <div class="property-group">
      <div class="property-group-title">Fonte de Dados</div>
      <div class="space-y-3">
        <div>
          <label class="label">Query SQL</label>
          <textarea
            class="input font-mono text-sm"
            rows="4"
            placeholder="SELECT * FROM tabela LIMIT 10"
            :value="element.dataSource.sqlQuery"
            @input="updateDataSource('sqlQuery', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
        <button class="btn-secondary text-sm w-full" @click="testQuery">
          Testar Query
        </button>
      </div>
    </div>

    <!-- Columns -->
    <div class="property-group">
      <div class="property-group-title flex items-center justify-between">
        <span>Colunas</span>
        <button class="text-accent text-xs hover:underline" @click="addColumn">
          + Adicionar
        </button>
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
            <input
              type="text"
              class="input py-1 text-sm"
              placeholder="Campo SQL"
              :value="col.field"
              @input="updateColumn(index, 'field', ($event.target as HTMLInputElement).value)"
            />
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

const updateProperty = (key: keyof ListElement['properties'], value: any) => {
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

const testQuery = () => {
  // TODO: Implement query testing
  alert('Funcionalidade de teste de query será implementada')
}
</script>
