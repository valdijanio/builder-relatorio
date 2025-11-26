<template>
  <NuxtLayout name="builder" :report-title="reportTitle" @save="saveReport" @preview="previewReport">
    <template #toolbox>
      <BuilderToolbox @drag-start="onDragStart" @drag-end="onDragEnd" />
    </template>

    <template #canvas>
      <BuilderCanvas />
    </template>

    <template #properties>
      <BuilderPropertiesPanel />
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ReportLayout, ReportElement } from '~/types/report'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { authFetch } = useAuth()
const { elements, loadElements, clearCanvas } = useCanvas()
const { datasets, loadDatasets, clearDatasets } = useDatasets()

const reportId = computed(() => route.params.id as string)
const isNewReport = computed(() => reportId.value === 'new')
const reportTitle = ref('Novo Relatório')
const reportDescription = ref('')

// Load report if editing existing
const loadReport = async () => {
  if (isNewReport.value) {
    clearCanvas()
    clearDatasets()
    return
  }

  try {
    const response = await authFetch<{ success: boolean; data: any }>(`/api/reports/${reportId.value}`)
    if (response.success && response.data) {
      reportTitle.value = response.data.title
      reportDescription.value = response.data.description || ''

      // Parse layout if it's a string (MySQL pode retornar como string)
      let layout = response.data.layout
      if (typeof layout === 'string') {
        layout = JSON.parse(layout)
      }

      console.log('Layout carregado:', layout)

      // Load datasets from layout
      if (layout?.datasets) {
        console.log('Datasets encontrados:', layout.datasets.length)
        loadDatasets(layout.datasets)
      }

      // Load elements from layout
      if (layout?.bands?.[0]?.elements) {
        console.log('Elementos encontrados:', layout.bands[0].elements.length)
        loadElements(layout.bands[0].elements)
      } else {
        console.warn('Nenhum elemento encontrado no layout:', layout)
      }
    }
  } catch (error) {
    console.error('Error loading report:', error)
    router.push('/')
  }
}

// Save report
const saveReport = async () => {
  const layout: ReportLayout = {
    version: '1.0',
    pageSettings: {
      width: 210,
      height: 297,
      orientation: 'portrait',
      margins: { top: 20, right: 15, bottom: 20, left: 15 },
      backgroundColor: '#ffffff',
    },
    datasets: datasets.value,  // Include datasets in layout
    bands: [
      {
        id: 'detail-1',
        type: 'detail',
        height: 800,
        elements: elements.value as ReportElement[],
      },
    ],
  }

  try {
    if (isNewReport.value) {
      // Create new report
      const title = prompt('Nome do relatório:', reportTitle.value)
      if (!title) return

      const response = await authFetch<{ success: boolean; data: { id: number } }>('/api/reports', {
        method: 'POST',
        body: {
          title,
          description: reportDescription.value,
          layout,
        },
      })

      if (response.success && response.data) {
        router.replace(`/reports/${response.data.id}/edit`)
      }
    } else {
      // Update existing
      await authFetch(`/api/reports/${reportId.value}`, {
        method: 'PUT',
        body: { layout },
      })
      alert('Relatório salvo com sucesso!')
    }
  } catch (error) {
    console.error('Error saving report:', error)
    alert('Erro ao salvar relatório')
  }
}

const previewReport = () => {
  // Navigate to preview page
  router.push(`/reports/${reportId.value}/preview`)
}

const onDragStart = () => {
  // Visual feedback during drag
}

const onDragEnd = () => {
  // Clean up after drag
}

onMounted(() => {
  loadReport()
})
</script>
