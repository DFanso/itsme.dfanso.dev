import { useEffect } from 'react'
import type { RefObject } from 'react'
import anime from 'animejs/lib/anime.es.js'

/**
 * Reveals a command block's output once, on mount — the DOM-driven
 * counterpart of the old site's `animateOutput` / `typeCharByChar` / the
 * `ls`-specific anime.js sequence (src-astro/pages/index.astro:
 * `animateOutput` 974-988, `typeCharByChar` 990-1011, `ls` branch 798-844).
 *
 * Behavior, given `ref` pointing at a block's `.command-output` element:
 *  - If the subtree contains a `.ls-header` (i.e. this is the `ls` output),
 *    run the anime.js stagger sequence over `.ls-header` / `.ls-entry` /
 *    `.ls-name` / `.ls-footer`, mirroring 803-842 exactly. This *replaces*
 *    the generic reveal below for that block, matching the old site (its
 *    `cmd === 'ls'` branch returns before ever calling `animateOutput`).
 *  - Otherwise: if the total text is under 100 characters and there's a
 *    single child element, type it in character-by-character (15ms +
 *    0-10ms jitter per char), restoring the original (already
 *    syntax-highlighted) markup once typing completes.
 *  - Otherwise, add a `typing-line` class (40ms staggered `animationDelay`)
 *    to each top-level child so they fade/slide in as whole lines.
 *
 * All timers and anime.js instances are cleaned up on unmount. The whole
 * hook no-ops under `prefers-reduced-motion: reduce`, and — because effects
 * never run during server rendering — it's inherently SSR-safe without any
 * extra guard.
 *
 * INVARIANT: this hook mutates the DOM inside `ref.current` directly
 * (adding classes/inline styles and, for the typing effect, temporarily
 * clearing then restoring `innerHTML`). That's only safe because the
 * component that owns this ref is wrapped in `React.memo` keyed by block id
 * (see `CommandBlock` in Terminal.tsx) and therefore never re-renders once
 * mounted — React never reconciles this subtree again, so there's no
 * conflict between these manual DOM writes and React's own rendering.
 *
 * Runs on mount only: the effect has an empty dependency array, and `ref`
 * (from `useRef`) is stable for the lifetime of the owning component
 * anyway.
 *
 * `options.disabled` skips the reveal entirely (seeded/initial blocks,
 * which should render statically — old-site parity: initial page-load
 * blocks were static, only newly-submitted commands animated). The hook
 * itself must still be called unconditionally on every render (Rules of
 * Hooks), so the early-return lives inside the effect rather than around
 * the `useEffect` call.
 */
export function useOutputReveal(
  ref: RefObject<HTMLElement | null>,
  options?: { disabled?: boolean },
): void {
  const disabled = options?.disabled ?? false

  useEffect(() => {
    if (disabled) return
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timers: number[] = []

    const lsHeader = root.querySelector<HTMLElement>('.ls-header')
    if (lsHeader) {
      const entries = Array.from(root.querySelectorAll<HTMLElement>('.ls-entry'))
      const names = Array.from(root.querySelectorAll<HTMLElement>('.ls-name'))
      const footer = root.querySelector<HTMLElement>('.ls-footer')

      for (const el of [lsHeader, footer, ...entries]) {
        if (el) {
          el.style.opacity = '0'
          el.style.transform = 'translateX(-14px)'
        }
      }

      const frame = window.requestAnimationFrame(() => {
        anime({ targets: lsHeader, opacity: [0, 1], translateX: [-14, 0], duration: 260, easing: 'easeOutCubic' })

        anime({
          targets: entries,
          opacity: [0, 1],
          translateX: [-14, 0],
          duration: 240,
          delay: anime.stagger(55, { start: 120 }),
          easing: 'easeOutCubic',
        })

        anime({
          targets: names,
          textShadow: [
            { value: '0 0 14px currentColor', duration: 120 },
            { value: '0 0 0px currentColor', duration: 280 },
          ],
          delay: anime.stagger(55, { start: 160 }),
          easing: 'easeOutQuad',
        })

        anime({
          targets: footer,
          opacity: [0, 1],
          translateX: [-14, 0],
          duration: 240,
          delay: entries.length * 55 + 200,
          easing: 'easeOutCubic',
        })
      })

      return () => {
        window.cancelAnimationFrame(frame)
        anime.remove([lsHeader, footer, ...entries, ...names])
      }
    }

    const textContent = root.textContent ?? ''
    const elements = root.children.length ? (Array.from(root.children) as HTMLElement[]) : [root]

    if (textContent.length < 100 && elements.length === 1) {
      const el = elements[0]
      const originalHTML = el.innerHTML
      const textOnly = el.textContent ?? ''
      el.innerHTML = ''

      let done = false
      let charIndex = 0
      const typeSpeed = 15
      const typeNextChar = () => {
        if (charIndex < textOnly.length) {
          el.textContent += textOnly[charIndex]
          charIndex++
          timers.push(window.setTimeout(typeNextChar, typeSpeed + Math.random() * 10))
        } else {
          done = true
          el.innerHTML = originalHTML
        }
      }
      typeNextChar()

      return () => {
        timers.forEach((timer) => window.clearTimeout(timer))
        if (!done) el.innerHTML = originalHTML
      }
    }

    elements.forEach((el, index) => {
      el.classList.add('typing-line')
      el.style.animationDelay = `${index * 40}ms`
    })

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [ref, disabled])
}
