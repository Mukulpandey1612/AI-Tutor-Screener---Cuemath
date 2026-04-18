// =============================================================================
// Server-side environment variable validation
// This file MUST only be imported from server components or API routes.
// It is never bundled into the client — Next.js App Router tree-shakes it.
// =============================================================================

const isDev = process.env.NODE_ENV === 'development'

/**
 * Reads and validates a required server-side env variable.
 * Logs a clear error in development, throws in all environments.
 */
export function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value || value.trim() === '') {
    const msg = [
      `[env] MISSING required environment variable: ${name}`,
      isDev
        ? `  -> Add "${name}=your_value" to .env.local and restart the dev server.`
        : `  -> Set "${name}" in your deployment environment variables (e.g. Vercel dashboard).`,
    ].join('\n')

    console.error(msg)
    throw new EnvError(name)
  }

  // Warn if placeholder value is still in place
  if (isDev && (value.includes('your_') || value === 'REPLACE_ME' || value === 'placeholder')) {
    console.warn(
      `[env] WARNING: ${name} looks like a placeholder value ("${value}"). ` +
      `Replace it with a real key in .env.local.`
    )
  }

  return value
}

/**
 * Reads an optional env variable. Returns null if not set.
 */
export function optionalEnv(name: string): string | null {
  const value = process.env[name]
  return value && value.trim() !== '' ? value : null
}

/**
 * Structured error thrown when a required env var is missing.
 * Lets API routes return a specific 503 instead of a generic 500.
 */
export class EnvError extends Error {
  public readonly envKey: string

  constructor(key: string) {
    super(`Environment variable not configured: ${key}`)
    this.name = 'EnvError'
    this.envKey = key
  }
}

/**
 * Log all relevant env var statuses on startup (dev only).
 * Import this from a server component or middleware if you want startup logging.
 */
export function logEnvStatus() {
  if (!isDev) return
  const vars = ['GEMINI_API_KEY']
  console.log('\n[env] Environment variable status:')
  for (const v of vars) {
    const val = process.env[v]
    if (!val) {
      console.error(`  MISSING  ${v}`)
    } else if (val.includes('your_') || val === 'REPLACE_ME') {
      console.warn(`  PLACEHOLDER ${v} (replace with a real value)`)
    } else {
      console.log(`  OK       ${v} (${val.slice(0, 6)}...)`)
    }
  }
  console.log('')
}
