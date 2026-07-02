import { useEffect } from 'react'

/**
 * Ported from src-astro/pages/index.astro's `bootUp` (1309-1327) plus the
 * `body.booting` / `body.booted` classes it toggles, which the CSS keys off
 * (src/styles/app.css:235-261 for `.terminal-container`'s entrance
 * animation, 660-692 for the "Booting portfolio OS..." / idle tooltips on
 * `#terminal`).
 *
 * The old site set `body.booting` synchronously at script-parse time — a
 * separate statement (index.astro:366-368) that ran *before* `bootUp` — and
 * only called `bootUp` itself once the page finished loading (handling both
 * the already-`complete` and the `load`-event cases, since Vite's deferred
 * module scripts could execute either before or after `window.load`).
 * `bootUp` then double-`requestAnimationFrame`'d (to guarantee the browser
 * painted the `booting` state at least once) before adding `booted`, and
 * removed `booting` 900ms later. Both steps collapse into this single mount
 * effect: add `booting` immediately, then replay the same double-rAF +
 * 900ms beat before swapping to `booted`.
 *
 * NOTE: the old site also flipped a `no-js` → `booting` swap for
 * progressive enhancement (index.astro:366-368), backed by
 * `body.no-js .terminal-container { opacity: 1 !important; ... }`
 * (app.css:244-248) as a JS-disabled fallback. `<body>` in the TanStack
 * root (src/routes/__root.tsx) never carries a `no-js` class, so the
 * fallback state is simply "no boot classes at all" — the CSS default,
 * fully visible — which already matches the old `.no-js` rule's intent
 * without needing the class here.
 *
 * SSR-safe: all work happens inside `useEffect`, which never runs during
 * server rendering, so there's no `document` access at module or render
 * time.
 */
export function useBootSequence(): void {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const body = document.body
    body.classList.add('booting')

    let raf1 = 0
    let raf2 = 0
    let timeoutId: number | undefined

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        body.classList.add('booted')
        timeoutId = window.setTimeout(() => body.classList.remove('booting'), 900)
      })
    })

    return () => {
      window.cancelAnimationFrame(raf1)
      window.cancelAnimationFrame(raf2)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
      body.classList.remove('booting', 'booted')
    }
  }, [])
}
