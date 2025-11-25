export default defineEventHandler(async (event) => {
  // Clear refresh token cookie
  deleteCookie(event, 'refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  })

  return {
    success: true,
    message: 'Logout realizado com sucesso',
  }
})
