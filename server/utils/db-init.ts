import { getPool } from './db'
import { hashPassword } from './password'

let initialized = false

export async function initializeDatabase() {
  if (initialized) return

  const pool = getPool()

  try {
    // Check if users table exists
    const [tables] = await pool.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'"
    )

    if ((tables as any[]).length === 0) {
      console.log('[DB] Tables not found, creating...')

      // Create users table
      await pool.execute(`
        CREATE TABLE users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role ENUM('admin', 'editor', 'viewer') DEFAULT 'editor',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email)
        )
      `)
      console.log('[DB] Created: users')

      // Create reports table
      await pool.execute(`
        CREATE TABLE reports (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          layout JSON NOT NULL,
          settings JSON,
          is_published BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_created_at (created_at)
        )
      `)
      console.log('[DB] Created: reports')

      // Create saved_queries table
      await pool.execute(`
        CREATE TABLE saved_queries (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          sql_query TEXT NOT NULL,
          parameters JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id)
        )
      `)
      console.log('[DB] Created: saved_queries')

      // Create sessions table
      await pool.execute(`
        CREATE TABLE sessions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          refresh_token VARCHAR(500) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_refresh_token (refresh_token),
          INDEX idx_user_id (user_id)
        )
      `)
      console.log('[DB] Created: sessions')

      console.log('[DB] All tables created successfully')

      // Create default admin user
      const adminPassword = await hashPassword('123')
      await pool.execute(
        'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        ['admin@admin.com', adminPassword, 'Administrador', 'admin']
      )

      console.log('[DB] Default admin user created: admin@admin.com / 123')
    } else {
      console.log('[DB] Tables already exist')
    }

    initialized = true
    console.log('[DB] Initialization complete')
  } catch (error: any) {
    console.error('[DB] Error initializing database:', error.message || error)
    // Don't throw - let the app continue and handle errors at request time
    initialized = true
  }
}
