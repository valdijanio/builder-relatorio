<template>
  <div class="min-h-screen bg-canvas-bg">
    <!-- Header -->
    <header class="h-12 bg-white border-b border-surface-border flex items-center px-4 sticky top-0 z-10">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"
      >
        <span>←</span>
        <span>Voltar</span>
      </NuxtLink>

      <div class="flex-1 text-center">
        <span class="font-medium text-text-primary">{{ reportTitle }}</span>
        <span class="text-text-muted ml-2">- Preview</span>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          :to="`/reports/${reportId}/edit`"
          class="btn-secondary text-sm"
        >
          Editar
        </NuxtLink>
        <button class="btn-secondary text-sm" @click="printReport">
          Imprimir
        </button>
      </div>
    </header>

    <!-- Preview Canvas -->
    <div class="flex justify-center p-8">
      <div
        class="bg-white shadow-lg relative"
        :style="canvasStyle"
      >
        <!-- Elements -->
        <div
          v-for="element in elements"
          :key="element.id"
          class="absolute"
          :style="getElementStyle(element)"
        >
          <component
            :is="getElementComponent(element.type)"
            :element="element"
            :preview-mode="true"
          />
        </div>

        <!-- Empty state -->
        <div
          v-if="elements.length === 0"
          class="absolute inset-0 flex items-center justify-center text-text-muted"
        >
          <div class="text-center">
            <div class="text-4xl mb-2">📄</div>
            <div>Relatório vazio</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReportLayout, ReportElement, ElementType } from '~/types/report'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const { authFetch } = useAuth()

// Use the same canvas state as the editor
const { elements: canvasElements } = useCanvas()

const reportId = computed(() => route.params.id as string)
const reportTitle = ref('Relatório')
const elements = ref<ReportElement[]>([])
const pageSettings = ref({
  width: 794,
  height: 1123,
})

// A4 dimensions in pixels at 96 DPI
const canvasStyle = computed(() => ({
  width: `${pageSettings.value.width}px`,
  minHeight: `${pageSettings.value.height}px`,
}))

const getElementStyle = (element: ReportElement) => ({
  left: `${element.position.x}px`,
  top: `${element.position.y}px`,
  width: `${element.size.width}px`,
  height: `${element.size.height}px`,
})

const getElementComponent = (type: ElementType) => {
  switch (type) {
    case 'text':
      return resolveComponent('ReportElementsTextElement')
    case 'number':
      return resolveComponent('ReportElementsNumberElement')
    case 'list':
      return resolveComponent('ReportElementsListElement')
    case 'chart':
      return resolveComponent('ReportElementsChartElement')
    default:
      return 'div'
  }
}

const loadReport = async () => {
  // For new reports or when coming from editor, use canvas state directly
  if (canvasElements.value && canvasElements.value.length > 0) {
    elements.value = canvasElements.value

    // If it's a saved report, also fetch the title
    if (reportId.value !== 'new') {
      try {
        const response = await authFetch<{ success: boolean; data: any }>(`/api/reports/${reportId.value}`)
        if (response.success && response.data) {
          reportTitle.value = response.data.title
        }
      } catch (error) {
        console.error('Error loading report title:', error)
      }
    } else {
      reportTitle.value = 'Novo Relatório'
    }
    return
  }

  // Fallback: load from API if canvas is empty (direct URL access)
  if (reportId.value !== 'new') {
    try {
      const response = await authFetch<{ success: boolean; data: any }>(`/api/reports/${reportId.value}`)
      if (response.success && response.data) {
        reportTitle.value = response.data.title

        // Parse layout if it's a string (MySQL pode retornar como string)
        let layout = response.data.layout
        if (typeof layout === 'string') {
          layout = JSON.parse(layout)
        }

        if (layout?.bands?.[0]?.elements) {
          elements.value = layout.bands[0].elements
        }
      }
    } catch (error) {
      console.error('Error loading report:', error)
    }
  }
}

const printReport = () => {
  window.print()
}

onMounted(() => {
  loadReport()
})
</script>

<style>
@media print {
  header {
    display: none !important;
  }

  body {
    background: white !important;
  }

  .bg-canvas-bg {
    background: white !important;
    padding: 0 !important;
  }
}
</style>
