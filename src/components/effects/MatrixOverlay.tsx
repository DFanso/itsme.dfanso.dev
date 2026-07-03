import { useEffect, useRef } from 'react'
import anime from 'animejs/lib/anime.es.js'

// Ported from src-astro/pages/index.astro:1015-1166 (`launchMatrixAnimation`).
// The old site built this overlay by creating detached DOM nodes and
// appending them to `document.body`; here the same visual structure is JSX
// (refs stand in for the imperative node references) so React owns
// mount/unmount, while the canvas rain loop, quote cycling and glitch
// pulses stay imperative (rAF + anime.js) inside a single mount-effect,
// matching the original's closures over `alive`/`rafId`.
//
// Exit fidelity: the original only called `overlay.remove()` once its
// fade-out tween completed. Here unmounting is owned by the parent
// (Terminal renders this only while `overlayVisible && state.overlay ===
// 'matrix'`), so `onExit` — which flips that state off — is deferred to the
// fade-out animation's `complete` callback instead of being invoked
// synchronously on click/Escape. That preserves the visible exit animation
// instead of having React yank the DOM out from under it.
//
// Reduced motion (improvement #4): the rain rAF loop, quote-cycle tween,
// glitch pulses and entry/exit fades are all "decorative loops" — skipped
// entirely. Instead the overlay renders in its final static state
// immediately (first quote visible, hint visible, black screen, no rain)
// and exit is instant.

interface MatrixOverlayProps {
  onExit: () => void
}

const QUOTES = [
  'Wake up, Neo...',
  'The Matrix has you.',
  'Follow the white rabbit.',
  'Knock, knock, Neo.',
  'There is no spoon.',
  'Free your mind.',
  '01001000 01100101 01101100 01101100 01101111',
  '// TODO: escape the simulation',
]

const CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF!@#$%^&*'
const FS = 14

export function MatrixOverlay({ onExit }: MatrixOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const overlay = overlayRef.current
    const canvas = canvasRef.current
    const quoteEl = quoteRef.current
    const hint = hintRef.current
    if (!overlay || !canvas || !quoteEl || !hint) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers: number[] = []
    let alive = true
    let rafId = 0

    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    const cols = Math.floor(W / FS)
    const drops: number[] = Array.from({ length: cols }, () => Math.random() * -(H / FS))

    function drawRain() {
      if (!alive || !ctx) return
      ctx.fillStyle = 'rgba(0,0,0,0.04)'
      ctx.fillRect(0, 0, W, H)

      for (let i = 0; i < cols; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)]
        const x = i * FS
        const y = drops[i] * FS

        if (drops[i] >= 0) {
          ctx.font = `bold ${FS}px monospace`
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = '#00ff41'
          ctx.shadowBlur = 12
          ctx.fillText(ch, x, y)

          ctx.font = `${FS}px monospace`
          ctx.fillStyle = '#00ff41'
          ctx.shadowBlur = 4
          if (y - FS > 0) ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - FS)
          if (y - FS * 2 > 0) {
            ctx.fillStyle = '#00aa28'
            ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - FS * 2)
          }
        }

        drops[i]++
        if (drops[i] * FS > H && Math.random() > 0.975) drops[i] = Math.floor(Math.random() * -20)
      }
      ctx.shadowBlur = 0
      rafId = window.requestAnimationFrame(drawRain)
    }

    let qi = 0
    function cycleQuote() {
      if (!alive) return
      quoteEl!.textContent = QUOTES[qi++ % QUOTES.length]
      anime({
        targets: quoteEl,
        opacity: [0, 1, 1, 0],
        scale: [0.94, 1, 1, 1.03],
        duration: 3800,
        easing: 'easeInOutSine',
        complete: () => {
          if (alive) timers.push(window.setTimeout(cycleQuote, 400))
        },
      })
    }

    function glitch() {
      if (!alive) return
      anime({
        targets: canvas,
        translateX: [0, () => (Math.random() - 0.5) * 12, 0, () => (Math.random() - 0.5) * 6, 0],
        skewX: [0, () => (Math.random() - 0.5) * 2, 0],
        duration: 120,
        easing: 'linear',
        complete: () => {
          if (alive) timers.push(window.setTimeout(glitch, 1800 + Math.random() * 4000))
        },
      })
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') exit()
    }

    function exit() {
      alive = false
      window.cancelAnimationFrame(rafId)
      document.removeEventListener('keydown', onKey)
      overlay!.removeEventListener('click', exit)

      if (reduced) {
        onExit()
        return
      }
      anime({
        targets: overlay,
        opacity: 0,
        scaleY: [1, 0.03],
        scaleX: [1, 1.08],
        duration: 550,
        easing: 'easeInBack',
        complete: onExit,
      })
    }

    document.addEventListener('keydown', onKey)
    overlay.addEventListener('click', exit)

    if (reduced) {
      // Static fallback: no rain loop, no quote cycling/glitch tweens, no
      // entry animation — show the first quote and hint immediately.
      overlay.style.opacity = '1'
      quoteEl.textContent = QUOTES[0]
      quoteEl.style.opacity = '1'
      hint.style.opacity = '0.45'
    } else {
      drawRain()
      anime({
        targets: overlay,
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuad',
        complete: () => {
          timers.push(window.setTimeout(cycleQuote, 800))
          timers.push(window.setTimeout(glitch, 2500))
          anime({ targets: hint, opacity: [0, 0.45], duration: 1200, delay: 600, easing: 'easeOutQuad' })
        },
      })
    }

    return () => {
      alive = false
      window.cancelAnimationFrame(rafId)
      timers.forEach((t) => window.clearTimeout(t))
      document.removeEventListener('keydown', onKey)
      overlay.removeEventListener('click', exit)
      anime.remove([overlay, canvas, quoteEl, hint])
    }
  }, [onExit])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div
        ref={quoteRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          color: '#00ff41',
          fontFamily: '"JetBrains Mono",monospace',
          fontSize: 'clamp(1rem,3vw,2.2rem)',
          textAlign: 'center',
          textShadow: '0 0 20px #00ff41,0 0 50px #00ff4180',
          zIndex: 2,
          opacity: 0,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          letterSpacing: '0.1em',
        }}
      />
      <div
        ref={hintRef}
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#00ff4145',
          fontFamily: 'monospace',
          fontSize: '0.7rem',
          zIndex: 2,
          letterSpacing: '0.3em',
          opacity: 0,
        }}
      >
        [ PRESS ESC OR CLICK TO EXIT ]
      </div>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background:
            'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,65,0.04) 2px,rgba(0,255,65,0.04) 4px)',
        }}
      />
    </div>
  )
}
