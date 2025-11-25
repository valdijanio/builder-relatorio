// SQL Sanitizer - Security utility for user-defined queries

const FORBIDDEN_KEYWORDS = [
  'DROP',
  'DELETE',
  'TRUNCATE',
  'ALTER',
  'CREATE',
  'INSERT',
  'UPDATE',
  'GRANT',
  'REVOKE',
  'EXEC',
  'EXECUTE',
  'CALL',
  'INTO OUTFILE',
  'INTO DUMPFILE',
  'LOAD_FILE',
  'BENCHMARK',
  'SLEEP',
  'INFORMATION_SCHEMA',
  'PERFORMANCE_SCHEMA',
  'MYSQL\\.',
]

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateSelectQuery(sql: string): ValidationResult {
  const normalizedSql = sql.toUpperCase().trim()

  // Must start with SELECT
  if (!normalizedSql.startsWith('SELECT')) {
    return { valid: false, error: 'Apenas queries SELECT são permitidas' }
  }

  // Check for forbidden keywords
  for (const keyword of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i')
    if (regex.test(normalizedSql)) {
      return { valid: false, error: `Keyword "${keyword}" não é permitida` }
    }
  }

  // Check for comments (can hide malicious commands)
  if (sql.includes('--') || sql.includes('/*') || sql.includes('*/')) {
    return { valid: false, error: 'Comentários não são permitidos' }
  }

  // Check for stacked queries (multiple queries with ;)
  const semicolonCount = (sql.match(/;/g) || []).length
  if (semicolonCount > 1 || (semicolonCount === 1 && !sql.trim().endsWith(';'))) {
    return { valid: false, error: 'Múltiplas queries não são permitidas' }
  }

  // Check for union-based injection attempts
  if (/UNION\s+(ALL\s+)?SELECT/i.test(sql)) {
    // Allow UNION but log for monitoring
    console.warn('Query contains UNION SELECT - monitoring for potential injection')
  }

  return { valid: true }
}

export function sanitizeQuery(sql: string): string {
  // Remove leading/trailing whitespace
  let sanitized = sql.trim()

  // Remove trailing semicolon if present
  if (sanitized.endsWith(';')) {
    sanitized = sanitized.slice(0, -1).trim()
  }

  return sanitized
}
