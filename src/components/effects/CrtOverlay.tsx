import { useEffect, useRef } from 'react'
import anime from 'animejs/lib/anime.es.js'

// Ported from src-astro/layouts/Layout.astro:157-236 (CRT monitor overlay
// markup + anime.js power-on / rolling-scanline / flicker animations).

export function CrtOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const poweronRef = useRef<HTMLDivElement>(null)
  const rollingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const poweron = poweronRef.current
    const rolling = rollingRef.current

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers: number[] = []
    let disposed = false

    if (reduced) {
      // Reduced motion: skip the power-on flash and the flicker/rolling
      // scanline loops entirely; just hide the power-on element.
      if (poweron) poweron.style.display = 'none'
    } else {
      // ── CRT Power-On (Layout.astro:181-201) ──────────────────────────────
      // 1. Tiny horizontal line bursts in
      // 2. Expands to fill screen
      // 3. Fades out, leaving content visible
      anime
        .timeline({ easing: 'easeOutQuart' })
        .add({
          targets: poweron,
          scaleY: [0, 0.0035],
          opacity: [0, 1],
          duration: 80,
          easing: 'easeInQuad',
        })
        .add({
          targets: poweron,
          scaleY: [0.0035, 1],
          duration: 320,
          easing: 'easeOutQuart',
        })
        .add({
          targets: poweron,
          opacity: [1, 0],
          duration: 480,
          easing: 'easeInQuad',
          complete: () => {
            if (poweron) poweron.style.display = 'none'
          },
        })

      // ── Rolling Scanline (Layout.astro:205-216) ──────────────────────────
      // A faint bright band that drifts from top to bottom every ~22s
      function rollScanline() {
        if (disposed || !rolling) return
        anime({
          targets: rolling,
          translateY: ['-80px', `${window.innerHeight + 80}px`],
          duration: 4500,
          delay: 1000,
          easing: 'linear',
          complete: () => {
            if (disposed) return
            timers.push(window.setTimeout(rollScanline, 16000 + Math.random() * 12000))
          },
        })
      }
      timers.push(window.setTimeout(rollScanline, 3500))

      // ── Flicker (Layout.astro:219-234) ────────────────────────────────────
      // Brief opacity stutter, like an old CRT struggling
      function flicker() {
        if (disposed || !overlay) return
        const steps = Math.random() > 0.5 ? 2 : 4
        const opacities = steps === 2 ? [1, 0.88, 1] : [1, 0.82, 1, 0.91, 1]
        anime({
          targets: overlay,
          opacity: opacities,
          duration: 90 * opacities.length,
          easing: 'linear',
          complete: () => {
            if (disposed) return
            timers.push(window.setTimeout(flicker, 7000 + Math.random() * 20000))
          },
        })
      }
      timers.push(window.setTimeout(flicker, 5000))
    }

    return () => {
      disposed = true
      timers.forEach(clearTimeout)
      anime.remove([overlay, poweron, rolling])
    }
  }, [])

  return (
    <>
      <div id="crt-overlay" aria-hidden="true" ref={overlayRef}>
        <div className="crt-scanlines" />
        <div className="crt-vignette" />
        <div className="crt-glare" />
        <div className="crt-rolling" ref={rollingRef} />
      </div>
      <div id="crt-poweron" aria-hidden="true" ref={poweronRef} />
    </>
  )
}
