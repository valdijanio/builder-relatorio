<template>
  <div class="min-h-screen bg-surface-secondary">
    <!-- Header -->
    <header class="bg-white border-b border-surface-border">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-text-primary">Report Builder</h1>
        <div class="flex items-center gap-4">
          <span class="text-text-secondary">{{ user?.name }}</span>
          <button class="btn-ghost text-sm" @click="logout">Sair</button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-text-primary">Meus Relatórios</h2>
        <button class="btn-primary" @click="createNewReport">
          + Novo Relatório
        </button>
      </div>

      <!-- Reports Grid -->
      <div v-if="reports.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="report in reports"
          :key="report.id"
          class="card p-4 hover:shadow-medium transition-shadow cursor-pointer"
          @click="editReport(report.id)"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-semibold text-text-primary">{{ report.title }}</h3>
              <p class="text-sm text-text-secondary mt-1">{{ report.description || 'Sem descrição' }}</p>
            </div>
            <span
              class="px-2 py-1 text-xs rounded"
              :class="report.isPublished ? 'bg-status-success/10 text-status-success' : 'bg-surface-tertiary text-text-muted'"
            >
              {{ report.isPublished ? 'Publicado' : 'Rascunho' }}
            </span>
          </div>
          <div class="mt-4 flex items-center justify-between text-xs text-text-muted">
            <span>Atualizado: {{ formatDate(report.updatedAt) }}</span>
            <button
              class="text-status-error hover:underline"
              @click.stop="deleteReport(report.id)"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card p-12 text-center">
        <div class="text-5xl mb-4">📊</div>
        <h3 class="text-lg font-semibold text-text-primary mb-2">Nenhum relatório ainda</h3>
        <p class="text-text-secondary mb-6">Crie seu primeiro relatório para começar</p>
        <button class="btn-primary" @click="createNewReport">
          + Criar Relatório
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { user, logout, authFetch } = useAuth()
const router = useRouter()

interface ReportSummary {
  id: number
  title: string
  description?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

const reports = ref<ReportSummary[]>([])

const fetchReports = async () => {
  try {
    const response = await authFetch<{ success: boolean; data: ReportSummary[] }>('/api/reports')
    if (response.success) {
      reports.value = response.data
    }
  } catch (error) {
    console.error('Error fetching reports:', error)
  }
}

const createNewReport = () => {
  router.push('/reports/new/edit')
}

const editReport = (id: number) => {
  router.push(`/reports/${id}/edit`)
}

const deleteReport = async (id: number) => {
  if (!confirm('Tem certeza que deseja excluir este relatório?')) return

  try {
    await authFetch(`/api/reports/${id}`, { method: 'DELETE' })
    reports.value = reports.value.filter(r => r.id !== id)
  } catch (error) {
    console.error('Error deleting report:', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchReports()
})
</script>
