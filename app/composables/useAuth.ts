import type { User } from '~/types/elements'

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
}

export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null)
  const accessToken = useState<string | null>('auth-token', () => null)
  const isLoading = useState<boolean>('auth-loading', () => false)

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      if (response.success && response.data) {
        accessToken.value = response.data.accessToken
        user.value = response.data.user as User
        return { success: true }
      }
      return { success: false, error: 'Login falhou' }
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Erro ao fazer login' }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (email: string, password: string, name: string) => {
    isLoading.value = true
    try {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { email, password, name },
      })

      if (response.success && response.data) {
        accessToken.value = response.data.accessToken
        user.value = response.data.user as User
        return { success: true }
      }
      return { success: false, error: 'Registro falhou' }
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Erro ao registrar' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      accessToken.value = null
      user.value = null
      navigateTo('/login')
    }
  }

  const fetchUser = async () => {
    if (!accessToken.value) return

    try {
      const response = await $fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })

      if (response.success && response.data) {
        user.value = response.data.user as User
      }
    } catch {
      // Token expired, try to refresh
      await refreshToken()
    }
  }

  const refreshToken = async () => {
    try {
      const response = await $fetch('/api/auth/refresh', {
        method: 'POST',
      })

      if (response.success && response.data) {
        accessToken.value = response.data.accessToken
        await fetchUser()
        return true
      }
    } catch {
      // Refresh failed, logout
      accessToken.value = null
      user.value = null
    }
    return false
  }

  // Auth fetch wrapper
  const authFetch = async <T>(url: string, options: any = {}): Promise<T> => {
    const headers = {
      ...options.headers,
      Authorization: accessToken.value ? `Bearer ${accessToken.value}` : '',
    }

    try {
      return await $fetch<T>(url, { ...options, headers })
    } catch (error: any) {
      if (error.statusCode === 401) {
        const refreshed = await refreshToken()
        if (refreshed) {
          headers.Authorization = `Bearer ${accessToken.value}`
          return await $fetch<T>(url, { ...options, headers })
        }
        navigateTo('/login')
      }
      throw error
    }
  }

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    refreshToken,
    authFetch,
  }
}
