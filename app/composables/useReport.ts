import type { Report } from '~/types/elements'
import type { ReportLayout } from '~/types/report'

export const useReport = () => {
  const { authFetch } = useAuth()

  const fetchReports = async () => {
    const response = await authFetch<{ success: boolean; data: Report[] }>('/api/reports')
    return response.success ? response.data : []
  }

  const fetchReport = async (id: number) => {
    const response = await authFetch<{ success: boolean; data: Report }>(`/api/reports/${id}`)
    return response.success ? response.data : null
  }

  const createReport = async (title: string, description?: string, layout?: ReportLayout) => {
    const defaultLayout: ReportLayout = layout || {
      version: '1.0',
      pageSettings: {
        width: 210,
        height: 297,
        orientation: 'portrait',
        margins: { top: 20, right: 15, bottom: 20, left: 15 },
        backgroundColor: '#ffffff',
      },
      bands: [],
    }

    const response = await authFetch<{ success: boolean; data: Report }>('/api/reports', {
      method: 'POST',
      body: { title, description, layout: defaultLayout },
    })

    return response.success ? response.data : null
  }

  const updateReport = async (id: number, updates: Partial<Report>) => {
    const response = await authFetch<{ success: boolean; data: Report }>(`/api/reports/${id}`, {
      method: 'PUT',
      body: updates,
    })

    return response.success ? response.data : null
  }

  const deleteReport = async (id: number) => {
    const response = await authFetch<{ success: boolean }>(`/api/reports/${id}`, {
      method: 'DELETE',
    })

    return response.success
  }

  return {
    fetchReports,
    fetchReport,
    createReport,
    updateReport,
    deleteReport,
  }
}
