const STORAGE_KEY = 'study-spaces-anonymous-reporter'
let memoryId: string | null = null
const PATTERN = /^[a-f0-9]{32}$/

/**
 * Non-identifying random browser session ID, used only to prevent two phones
 * behind the same Vite proxy from sharing a 30-second report cooldown.
 *
 * It is not an account or authentication token. No location is stored here.
 * sessionStorage intentionally resets when the browser session ends.
 */
export function anonymousReporterId(): string | null {
  if (memoryId) return memoryId
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (stored && PATTERN.test(stored)) {
      memoryId = stored
      return stored
    }
    const bytes = new Uint8Array(16)
    globalThis.crypto.getRandomValues(bytes)
    const id = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    memoryId = id
    window.sessionStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    // Private-mode storage and older browsers may be unavailable. In this case
    // the API's legacy network-IP-based limiter remains functional.
    return null
  }
}
