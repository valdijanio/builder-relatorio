<template>
  <div class="space-y-2">
    <!-- Add Button -->
    <button
      class="w-full btn-primary text-sm py-1.5"
      @click="showAddModal = true"
    >
      + Novo Dataset
    </button>

    <!-- Datasets List -->
    <div v-if="datasets.length === 0" class="text-center py-6 text-text-muted text-sm">
      Nenhum dataset criado
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="dataset in datasets"
        :key="dataset.id"
        class="border border-surface-border rounded-lg overflow-hidden"
      >
        <!-- Dataset Header -->
        <div
          class="px-3 py-2 bg-surface-tertiary/50 flex items-center justify-between cursor-pointer"
          @click="toggleExpanded(dataset.id)"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span class="text-xs text-text-muted">
              {{ expandedDatasets.has(dataset.id) ? '▼' : '▶' }}
            </span>
            <span class="text-sm font-medium text-text-primary truncate">
              {{ dataset.name }}
            </span>
            <span
              v-if="isDatasetLoading(dataset.id)"
              class="text-xs text-accent animate-pulse"
            >
              ...
            </span>
            <span
              v-else-if="getDatasetError(dataset.id)"
              class="text-xs text-status-error"
              :title="getDatasetError(dataset.id)"
            >
              !
            </span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="p-1 text-text-muted hover:text-accent"
              title="Executar"
              @click.stop="testDataset(dataset.id)"
            >
              ▶
            </button>
            <button
              class="p-1 text-text-muted hover:text-accent"
              title="Editar"
              @click.stop="editDataset(dataset)"
            >
              ✎
            </button>
            <button
              class="p-1 text-text-muted hover:text-status-error"
              title="Excluir"
              @click.stop="confirmDelete(dataset)"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Dataset Details (Expanded) -->
        <div
          v-if="expandedDatasets.has(dataset.id)"
          class="px-3 py-2 space-y-2 text-xs border-t border-surface-border"
        >
          <!-- SQL Preview -->
          <div class="bg-surface-tertiary rounded p-2 font-mono text-text-secondary overflow-x-auto max-h-20">
            {{ dataset.sqlQuery.substring(0, 150) }}{{ dataset.sqlQuery.length > 150 ? '...' : '' }}
          </div>

          <!-- Fields -->
          <div v-if="getDatasetFields(dataset.id).length > 0">
            <span class="text-text-muted">Campos: </span>
            <span class="text-text-secondary">
              {{ getDatasetFields(dataset.id).join(', ') }}
            </span>
          </div>

          <!-- Row count -->
          <div v-if="getDatasetData(dataset.id).length > 0" class="text-text-muted">
            {{ getDatasetData(dataset.id).length }} registros
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showAddModal || editingDataset"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <!-- Modal Header -->
        <div class="px-4 py-3 border-b border-surface-border flex items-center justify-between">
          <h3 class="font-semibold text-text-primary">
            {{ editingDataset ? 'Editar Dataset' : 'Novo Dataset' }}
          </h3>
          <button class="text-text-muted hover:text-text-primary" @click="closeModal">
            ✕
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-4 space-y-4 flex-1 overflow-y-auto">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              Nome do Dataset
            </label>
            <input
              v-model="formData.name"
              type="text"
              class="input w-full"
              placeholder="Ex: vendas_por_regiao"
            />
          </div>

          <!-- SQL Query -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              Query SQL
            </label>
            <textarea
              v-model="formData.sqlQuery"
              rows="6"
              class="input w-full font-mono text-sm"
              placeholder="SELECT coluna1, coluna2 FROM tabela WHERE ..."
            />
          </div>

          <!-- Test Result -->
          <div v-if="testResult" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-text-primary">Resultado do Teste</span>
              <span class="text-xs text-text-muted">
                {{ testResult.rows.length }} registros
              </span>
            </div>
            <div class="max-h-40 overflow-auto border border-surface-border rounded">
              <table class="w-full text-xs">
                <thead class="bg-surface-tertiary sticky top-0">
                  <tr>
                    <th
                      v-for="field in testResult.fields"
                      :key="field"
                      class="px-2 py-1 text-left font-medium text-text-primary"
                    >
                      {{ field }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, idx) in testResult.rows.slice(0, 10)"
                    :key="idx"
                    class="border-t border-surface-border"
                  >
                    <td
                      v-for="field in testResult.fields"
                      :key="field"
                      class="px-2 py-1 text-text-secondary"
                    >
                      {{ row[field] }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Test Error -->
          <div v-if="testError" class="p-3 bg-red-50 border border-red-200 rounded text-sm text-status-error">
            {{ testError }}
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-4 py-3 border-t border-surface-border flex items-center justify-between">
          <button
            class="btn-secondary text-sm"
            :disabled="!formData.sqlQuery || isTesting"
            @click="testQuery"
          >
            {{ isTesting ? 'Testando...' : 'Testar Query' }}
          </button>
          <div class="flex gap-2">
            <button class="btn-ghost text-sm" @click="closeModal">
              Cancelar
            </button>
            <button
              class="btn-primary text-sm"
              :disabled="!formData.name || !formData.sqlQuery"
              @click="saveDataset"
            >
              {{ editingDataset ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Dataset } from '~/types/report'

const {
  datasets,
  addDataset,
  updateDataset,
  removeDataset,
  executeDataset,
  getDatasetData,
  getDatasetFields,
  isDatasetLoading,
  getDatasetError,
} = useDatasets()

const { executeQuery } = useQueryExecutor()

const showAddModal = ref(false)
const editingDataset = ref<Dataset | null>(null)
const expandedDatasets = ref<Set<string>>(new Set())

const formData = ref({
  name: '',
  sqlQuery: '',
})

const testResult = ref<{ rows: Record<string, unknown>[]; fields: string[] } | null>(null)
const testError = ref<string | null>(null)
const isTesting = ref(false)

const toggleExpanded = (id: string) => {
  if (expandedDatasets.value.has(id)) {
    expandedDatasets.value.delete(id)
  } else {
    expandedDatasets.value.add(id)
  }
}

const testDataset = async (id: string) => {
  await executeDataset(id)
}

const editDataset = (dataset: Dataset) => {
  editingDataset.value = dataset
  formData.value = {
    name: dataset.name,
    sqlQuery: dataset.sqlQuery,
  }
  testResult.value = null
  testError.value = null
}

const confirmDelete = (dataset: Dataset) => {
  if (confirm(`Excluir dataset "${dataset.name}"?`)) {
    removeDataset(dataset.id)
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingDataset.value = null
  formData.value = { name: '', sqlQuery: '' }
  testResult.value = null
  testError.value = null
}

const testQuery = async () => {
  if (!formData.value.sqlQuery) return

  isTesting.value = true
  testResult.value = null
  testError.value = null

  try {
    const result = await executeQuery(formData.value.sqlQuery)
    if (result && result.rows) {
      testResult.value = {
        rows: result.rows,
        fields: result.rows.length > 0 ? Object.keys(result.rows[0]) : [],
      }
    } else {
      testError.value = 'Nenhum resultado retornado'
    }
  } catch (error: any) {
    testError.value = error.message || 'Erro ao executar query'
  } finally {
    isTesting.value = false
  }
}

const saveDataset = () => {
  if (!formData.value.name || !formData.value.sqlQuery) return

  if (editingDataset.value) {
    // Update existing
    updateDataset(editingDataset.value.id, {
      name: formData.value.name,
      sqlQuery: formData.value.sqlQuery,
    })
  } else {
    // Create new
    addDataset({
      name: formData.value.name,
      sqlQuery: formData.value.sqlQuery,
    })
  }

  closeModal()
}
</script>
