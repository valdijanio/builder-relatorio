export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, restoreSession, accessToken } = useAuth()

  // Try to restore session from localStorage first
  await restoreSession()

  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
