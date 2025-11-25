export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser, accessToken } = useAuth()

  // Try to restore session if we have a token but no user
  if (accessToken.value && !isAuthenticated.value) {
    await fetchUser()
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
