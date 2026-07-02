import { useEffect } from 'react'
import anime from 'animejs/lib/anime.es.js'

// Ported from src-astro/pages/index.astro:1330-1473 (`startAmbientAnimations`
// and its four sub-functions: `startGlowPulse` 1338, `spawnFloatingParticles`
// 1355, `startTitleGlitch` 1400, `startEnterBurst` 1438). The old site
// queried the DOM directly since everything lived in one script; here those
// elements (`.terminal-container`, `.min-h-screen`, `.terminal-title`,
// `#input-line` / `.cursor`) are rendered by sibling/ancestor components
// (Terminal, TitleBar, InputLine) instead, so this component still reaches
// them via the same selectors. Mounted once on the index route (see
// src/routes/index.tsx) alongside `<Terminal />` — React flushes all DOM
// mutations before any effect runs, regardless of declaration order, so
// those elements are guaranteed to exist by the time this effect fires.
//
// Renders nothing; it's purely a bundle of side-effecting animation loops.
// Every one of the four no-ops under `prefers-reduced-motion: reduce`
// (improvement #4), the floating-particle count is halved below the `sm`
// breakpoint (improvement #3), and every rAF/timeout/interval/listener and
// spawned particle node is tracked and torn down on unmount.

export function AmbientEffects() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timers: number[] = []
    const intervals: number[] = []
    const cleanups: Array<() => void> = []

    // 1. Breathing neon glow on the terminal border.
    const container = document.querySelector<HTMLElement>('.terminal-container')
    if (container) {
      anime({
        targets: container,
        boxShadow: [
          '0 0 20px rgba(0,0,0,0.4), 0 0 60px rgba(122,162,247,0.08)',
          '0 0 30px rgba(0,0,0,0.4), 0 0 90px rgba(122,162,247,0.28), 0 0 140px rgba(187,154,247,0.12)',
          '0 0 20px rgba(0,0,0,0.4), 0 0 60px rgba(122,162,247,0.08)',
        ],
        duration: 4000,
        easing: 'easeInOutSine',
        loop: true,
      })
      cleanups.push(() => anime.remove(container))
    }

    // 2. Floating code glyphs drifting behind the terminal.
    const bg = document.querySelector<HTMLElement>('.min-h-screen')
    if (bg) {
      bg.style.position = 'relative'
      const GLYPHS = '01{}[]<>/アイウカキクコサシスタチツ#$%@!~'
      const COLORS = ['#7aa2f720', '#bb9af720', '#9ece6a18', '#e0af6818', '#7dcfff15']
      // Improvement #3: halve the particle count below the `sm` breakpoint.
      const count = window.innerWidth < 640 ? 12 : 22
      const particles: HTMLElement[] = []

      for (let i = 0; i < count; i++) {
        const el = document.createElement('div')
        el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        const size = 10 + Math.random() * 14
        el.style.cssText = [
          'position:absolute;pointer-events:none;user-select:none;',
          `font-family:"JetBrains Mono",monospace;font-size:${size}px;`,
          `color:${COLORS[Math.floor(Math.random() * COLORS.length)]};`,
          `left:${Math.random() * 100}%;top:${Math.random() * 100}%;`,
          'z-index:0;opacity:0;',
        ].join('')
        bg.appendChild(el)
        particles.push(el)

        const delay = Math.random() * 6000
        const dur = 6000 + Math.random() * 8000

        // Periodically change the glyph character.
        const intervalId = window.setInterval(() => {
          el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }, dur)
        intervals.push(intervalId)

        anime({
          targets: el,
          opacity: [0, 1, 1, 0],
          translateY: [0, -(60 + Math.random() * 80)],
          translateX: [(Math.random() - 0.5) * 40],
          rotate: [(Math.random() - 0.5) * 20],
          duration: dur,
          delay,
          easing: 'easeInOutSine',
          loop: true,
          direction: 'normal',
        })
      }

      cleanups.push(() => {
        anime.remove(particles)
        particles.forEach((el) => el.remove())
      })
    }

    // 3. Periodic random glitch on the terminal title text.
    const title = document.querySelector<HTMLElement>('.terminal-title')
    if (title) {
      const original = title.textContent || ''
      const glitchChars = '!@#$%^&*<>?/|[]{}~`'

      function doGlitch() {
        if (!title) return
        const steps = 8
        let step = 0
        const iv = window.setInterval(() => {
          let out = ''
          for (let i = 0; i < original.length; i++) {
            out +=
              Math.random() > 0.65 && original[i] !== ' '
                ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
                : original[i]
          }
          title.textContent = out
          if (++step >= steps) {
            window.clearInterval(iv)
            title.textContent = original
          }
        }, 50)
        intervals.push(iv)

        anime({
          targets: title,
          color: ['#c0caf5', '#f7768e', '#7aa2f7', '#c0caf5'],
          translateX: [0, -3, 3, -1, 0],
          duration: steps * 50,
          easing: 'linear',
        })

        timers.push(window.setTimeout(doGlitch, 9000 + Math.random() * 14000))
      }

      timers.push(window.setTimeout(doGlitch, 5000 + Math.random() * 5000))

      cleanups.push(() => {
        anime.remove(title)
        title.textContent = original
      })
    }

    // 4. Tiny particle burst from the cursor on every Enter keypress.
    const inputLine = document.getElementById('input-line')
    if (inputLine) {
      const burstParticles: HTMLElement[] = []
      const onEnter = (e: KeyboardEvent) => {
        if (e.key !== 'Enter') return
        const cursor = inputLine.querySelector<HTMLElement>('.cursor')
        if (!cursor) return
        const rect = cursor.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2

        const COLORS = ['#7aa2f7', '#9ece6a', '#bb9af7', '#e0af68']
        for (let i = 0; i < 8; i++) {
          const p = document.createElement('div')
          const col = COLORS[Math.floor(Math.random() * COLORS.length)]
          p.style.cssText = [
            'position:fixed;width:3px;height:3px;border-radius:50%;',
            `background:${col};box-shadow:0 0 4px ${col};`,
            'pointer-events:none;z-index:9998;',
            `left:${cx}px;top:${cy}px;`,
          ].join('')
          document.body.appendChild(p)
          burstParticles.push(p)
          anime({
            targets: p,
            translateX: () => (Math.random() - 0.5) * 80,
            translateY: () => (Math.random() - 0.5) * 60,
            scale: [1, 0],
            opacity: [1, 0],
            duration: 500 + Math.random() * 300,
            easing: 'easeOutQuad',
            complete: () => p.remove(),
          })
        }
      }
      document.addEventListener('keydown', onEnter)
      cleanups.push(() => {
        document.removeEventListener('keydown', onEnter)
        anime.remove(burstParticles)
        burstParticles.forEach((p) => p.remove())
      })
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      intervals.forEach((i) => window.clearInterval(i))
      cleanups.forEach((fn) => fn())
    }
  }, [])

  return null
}
