import { initializeDatabase } from '../utils/db-init'

export default defineNitroPlugin(async () => {
  console.log('[Plugin] Initializing database...')
  await initializeDatabase()
  console.log('[Plugin] Database ready')
})
