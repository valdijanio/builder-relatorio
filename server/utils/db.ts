import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../database/schema'

let pool: mysql.Pool | null = null
let db: ReturnType<typeof drizzle> | null = null

export function getPool() {
  if (!pool) {
    const config = useRuntimeConfig()
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

export function getDb() {
  if (!db) {
    db = drizzle(getPool(), { schema, mode: 'default' })
  }
  return db
}

// Read-only pool for user queries (security)
let readOnlyPool: mysql.Pool | null = null

export function getReadOnlyPool() {
  if (!readOnlyPool) {
    const config = useRuntimeConfig()
    readOnlyPool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user, // In production, use a read-only user
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    })
  }
  return readOnlyPool
}

// Execute raw SQL query (for user-defined queries)
export async function executeRawQuery(sql: string, params: unknown[] = []) {
  const pool = getReadOnlyPool()
  const [rows] = await pool.execute(sql, params)
  return rows
}
