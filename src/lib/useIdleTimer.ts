import { useEffect } from 'react'

// Ported from the `resetIdleTimer`/`attachGlobalIdleListeners` methods
// (src-astro/pages/index.astro:397-405, 595-599). After 7s with no
// mousemove/touchstart/keydown, `body` gets `.terminal-idle` (which the CSS
// uses to switch the cursor to an idle pulse animation); any of those events
// clears it and restarts the countdown. SSR-safe (no-op when `window` is
// undefined) and fully cleaned up on unmount.

const IDLE_DELAY_MS = 7000

export function useIdleTimer(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let timeoutId: number | undefined

    function resetIdleTimer() {
      document.body.classList.remove('terminal-idle')
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
      timeoutId = window.setTimeout(() => {
        document.body.classList.add('terminal-idle')
      }, IDLE_DELAY_MS)
    }

    window.addEventListener('mousemove', resetIdleTimer)
    window.addEventListener('touchstart', resetIdleTimer, { passive: true })
    window.addEventListener('keydown', resetIdleTimer)

    resetIdleTimer()

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer)
      window.removeEventListener('touchstart', resetIdleTimer)
      window.removeEventListener('keydown', resetIdleTimer)
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
      document.body.classList.remove('terminal-idle')
    }
  }, [])
}
