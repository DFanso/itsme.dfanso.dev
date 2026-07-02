import type React from 'react'
import { useEffect, useRef } from 'react'
import anime from 'animejs/lib/anime.es.js'

// Ported from src-astro/pages/index.astro:1168-1306 (`launchHackSequence`).
// The set of log lines / progress bars is fixed (not data-driven), so —
// unlike the original's `mkLine`/`mkBar` DOM-builder helpers — it's static
// JSX here, with refs standing in for the node references the original
// captured as local variables. The `anime.timeline` sequencing, per-bar
// `update` progress callback, and the "ACCESS GRANTED" particle burst stay
// imperative inside a single mount-effect.
//
// Exit fidelity: same trade-off as MatrixOverlay — `onExit` (which the
// parent uses to unmount this component) is deferred to the exit fade's
// `complete` callback rather than called synchronously on click/Escape, so
// the fade-out is actually visible instead of being cut off by an immediate
// unmount.
//
// Reduced motion (improvement #4): the entire timeline (staggered line/bar
// reveals, elastic "ACCESS GRANTED" bounce, glitch color flash, particle
// burst) is one continuous decorative sequence with no separable "core"
// content, so it's skipped wholesale — every line/bar renders in its final
// state immediately, and exit is instant (no fade).

interface HackOverlayProps {
  onExit: () => void
}

function Bar({
  label,
  color,
  wrapRef,
  barRef,
  pctRef,
}: {
  label: string
  color: string
  wrapRef: React.RefObject<HTMLDivElement | null>
  barRef: React.RefObject<HTMLDivElement | null>
  pctRef: React.RefObject<HTMLSpanElement | null>
}) {
  return (
    <div ref={wrapRef} style={{ margin: '5px 0', opacity: 0 }}>
      <div style={{ color, fontSize: '0.75rem', marginBottom: 3 }}>{label}</div>
      <div
        style={{
          width: '100%',
          height: 10,
          background: '#0a1a0a',
          border: `1px solid ${color}35`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          ref={barRef}
          style={{ height: '100%', width: '0%', background: color, boxShadow: `0 0 8px ${color}` }}
        />
        <span
          ref={pctRef}
          style={{
            position: 'absolute',
            right: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            mixBlendMode: 'difference',
            color: '#fff',
          }}
        >
          0%
        </span>
      </div>
    </div>
  )
}

export function HackOverlay({ onExit }: HackOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const l1Ref = useRef<HTMLDivElement>(null)
  const l2Ref = useRef<HTMLDivElement>(null)
  const l3Ref = useRef<HTMLDivElement>(null)
  const l4Ref = useRef<HTMLDivElement>(null)
  const sep1Ref = useRef<HTMLDivElement>(null)
  const sep2Ref = useRef<HTMLDivElement>(null)
  const grantedRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const rootResultRef = useRef<HTMLDivElement>(null)
  const lol1Ref = useRef<HTMLDivElement>(null)
  const lol2Ref = useRef<HTMLDivElement>(null)
  const lol3Ref = useRef<HTMLDivElement>(null)
  const exitHintRef = useRef<HTMLDivElement>(null)

  const pb1WrapRef = useRef<HTMLDivElement>(null)
  const pb1BarRef = useRef<HTMLDivElement>(null)
  const pb1PctRef = useRef<HTMLSpanElement>(null)
  const pb2WrapRef = useRef<HTMLDivElement>(null)
  const pb2BarRef = useRef<HTMLDivElement>(null)
  const pb2PctRef = useRef<HTMLSpanElement>(null)
  const pb3WrapRef = useRef<HTMLDivElement>(null)
  const pb3BarRef = useRef<HTMLDivElement>(null)
  const pb3PctRef = useRef<HTMLSpanElement>(null)
  const pb4WrapRef = useRef<HTMLDivElement>(null)
  const pb4BarRef = useRef<HTMLDivElement>(null)
  const pb4PctRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const overlay = overlayRef.current
    if (!overlay) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lineRefs = [
      l1Ref,
      l2Ref,
      l3Ref,
      l4Ref,
      sep1Ref,
      sep2Ref,
      grantedRef,
      rootRef,
      rootResultRef,
      lol1Ref,
      lol2Ref,
      lol3Ref,
      exitHintRef,
    ]
    const bars = [
      { wrap: pb1WrapRef, bar: pb1BarRef, pct: pb1PctRef },
      { wrap: pb2WrapRef, bar: pb2BarRef, pct: pb2PctRef },
      { wrap: pb3WrapRef, bar: pb3BarRef, pct: pb3PctRef },
      { wrap: pb4WrapRef, bar: pb4BarRef, pct: pb4PctRef },
    ]

    let tl: anime.AnimeTimelineInstance | null = null
    const particles: HTMLDivElement[] = []

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') exit()
    }

    function exit() {
      document.removeEventListener('keydown', onKey)
      overlay!.removeEventListener('click', exit)

      if (reduced) {
        onExit()
        return
      }
      anime({ targets: overlay, opacity: 0, duration: 400, easing: 'easeInQuad', complete: onExit })
    }

    document.addEventListener('keydown', onKey)
    overlay.addEventListener('click', exit)

    if (reduced) {
      // Static fallback: skip the whole reveal timeline and particle burst
      // — show every line/bar in its final state immediately.
      overlay.style.opacity = '1'
      lineRefs.forEach((r) => {
        if (r.current) r.current.style.opacity = '1'
      })
      bars.forEach((pb) => {
        if (pb.wrap.current) pb.wrap.current.style.opacity = '1'
        if (pb.bar.current) pb.bar.current.style.width = '100%'
        if (pb.pct.current) pb.pct.current.textContent = '100%'
      })
    } else {
      tl = anime.timeline({ easing: 'easeOutQuad', autoplay: true })

      // Phase 1: Connection
      tl.add({ targets: l1Ref.current, opacity: [0, 1], duration: 350 })
        .add({ targets: l2Ref.current, opacity: [0, 1], duration: 350 }, '+=150')
        .add({ targets: l3Ref.current, opacity: [0, 1], duration: 350 }, '+=100')
        .add({ targets: l4Ref.current, opacity: [0, 1], duration: 350 }, '+=150')
        .add({ targets: sep1Ref.current, opacity: [0, 0.6], duration: 200 }, '+=200')

      // Phase 2: Progress bars
      bars.forEach((pb, idx) => {
        tl!.add({ targets: pb.wrap.current, opacity: [0, 1], duration: 250 }, idx === 0 ? '+=300' : '+=50')
        tl!.add(
          {
            targets: pb.bar.current,
            width: ['0%', '100%'],
            duration: 1400,
            easing: 'easeInOutCubic',
            update(anim: anime.AnimeInstance) {
              if (pb.pct.current) pb.pct.current.textContent = Math.round(anim.progress) + '%'
            },
          },
          '+=80',
        )
      })

      // Phase 3: Access Granted
      tl.add({ targets: sep2Ref.current, opacity: [0, 0.6], duration: 200 }, '+=200')
        .add(
          { targets: grantedRef.current, opacity: [0, 1], scale: [0.75, 1], duration: 700, easing: 'easeOutElastic(1, 0.5)' },
          '+=200',
        )
        // Glitch flash on granted text
        .add(
          {
            targets: grantedRef.current,
            translateX: [0, -4, 4, -2, 2, 0],
            color: ['#00ff41', '#ff0044', '#00ff41', '#0044ff', '#00ff41'],
            duration: 350,
            easing: 'linear',
          },
          '+=300',
        )
        .add({ targets: rootRef.current, opacity: [0, 1], duration: 300 }, '+=200')
        .add({ targets: rootResultRef.current, opacity: [0, 1], duration: 250 }, '+=100')
        .add({ targets: lol1Ref.current, opacity: [0, 1], duration: 300 }, '+=150')
        .add({ targets: lol2Ref.current, opacity: [0, 1], duration: 300 }, '+=100')
        .add({ targets: lol3Ref.current, opacity: [0, 1], duration: 400 }, '+=150')
        .add({ targets: exitHintRef.current, opacity: [0, 0.6], duration: 400 }, '+=300')
        // Particle burst on ACCESS GRANTED
        .add(
          {
            begin() {
              const rect = grantedRef.current?.getBoundingClientRect()
              if (!rect) return
              const cx = rect.left + rect.width / 2
              const cy = rect.top + rect.height / 2
              for (let i = 0; i < 40; i++) {
                const p = document.createElement('div')
                const hue = Math.random() > 0.6 ? '#00ff41' : Math.random() > 0.5 ? '#7aa2f7' : '#f7768e'
                p.style.cssText = `position:fixed;width:${3 + Math.random() * 4}px;height:${3 + Math.random() * 4}px;background:${hue};border-radius:50%;box-shadow:0 0 6px ${hue};pointer-events:none;z-index:10000;left:${cx}px;top:${cy}px;`
                document.body.appendChild(p)
                particles.push(p)
                anime({
                  targets: p,
                  translateX: () => (Math.random() - 0.5) * 500,
                  translateY: () => (Math.random() - 0.5) * 400,
                  scale: [1, 0],
                  opacity: [1, 0],
                  duration: 900 + Math.random() * 600,
                  easing: 'easeOutQuad',
                  complete: () => p.remove(),
                })
              }
            },
            duration: 10,
          },
          '-=650',
        )

      // Entry fade
      anime({ targets: overlay, opacity: [0, 1], duration: 300, easing: 'easeOutQuad' })
    }

    return () => {
      document.removeEventListener('keydown', onKey)
      overlay.removeEventListener('click', exit)
      tl?.pause()
      anime.remove([
        overlay,
        ...lineRefs.map((r) => r.current),
        ...bars.flatMap((pb) => [pb.wrap.current, pb.bar.current]),
        ...particles,
      ])
      particles.forEach((p) => p.remove())
    }
  }, [onExit])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#080808',
        overflow: 'hidden',
        fontFamily: '"JetBrains Mono",monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background:
            'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,65,0.025) 2px,rgba(0,255,65,0.025) 4px)',
        }}
      />
      <div style={{ width: 'min(720px, 90%)', position: 'relative', zIndex: 1 }}>
        <div ref={l1Ref} style={{ color: '#00ff41', opacity: 0, margin: '3px 0', fontSize: 'clamp(0.65rem,1.8vw,0.85rem)' }}>
          {'> Establishing encrypted tunnel to itsme.dfanso.dev...'}
        </div>
        <div ref={l2Ref} style={{ color: '#7aa2f7', opacity: 0, margin: '3px 0', fontSize: 'clamp(0.65rem,1.8vw,0.85rem)' }}>
          {'> Resolved IP: 76.76.21.21 | ASN: Vercel Inc.'}
        </div>
        <div ref={l3Ref} style={{ color: '#a9b1d6', opacity: 0, margin: '3px 0', fontSize: 'clamp(0.65rem,1.8vw,0.85rem)' }}>
          {'> RTT: 0.4ms  |  Packet loss: 0%  |  TTL: 64'}
        </div>
        <div ref={l4Ref} style={{ color: '#9ece6a', opacity: 0, margin: '3px 0', fontSize: 'clamp(0.65rem,1.8vw,0.85rem)' }}>
          {'> TLS 1.3 handshake complete. Session key established. ✓'}
        </div>
        <div ref={sep1Ref} style={{ color: '#1a3a1a', opacity: 0, margin: '3px 0', fontSize: 'clamp(0.65rem,1.8vw,0.85rem)' }}>
          {'─'.repeat(60)}
        </div>

        <Bar label="[ BYPASSING CLOUDFLARE WAF ]" color="#f7768e" wrapRef={pb1WrapRef} barRef={pb1BarRef} pctRef={pb1PctRef} />
        <Bar label="[ EXPLOITING CVE-2024-LMAO ]" color="#e0af68" wrapRef={pb2WrapRef} barRef={pb2BarRef} pctRef={pb2PctRef} />
        <Bar
          label="[ INJECTING REVERSE SHELL PAYLOAD ]"
          color="#bb9af7"
          wrapRef={pb3WrapRef}
          barRef={pb3BarRef}
          pctRef={pb3PctRef}
        />
        <Bar
          label="[ ESCALATING TO ROOT PRIVILEGES ]"
          color="#7aa2f7"
          wrapRef={pb4WrapRef}
          barRef={pb4BarRef}
          pctRef={pb4PctRef}
        />

        <div ref={sep2Ref} style={{ color: '#1a3a1a', opacity: 0, margin: '3px 0', fontSize: 'clamp(0.65rem,1.8vw,0.85rem)' }}>
          {'─'.repeat(60)}
        </div>
        <div
          ref={grantedRef}
          style={{
            color: '#00ff41',
            opacity: 0,
            margin: '3px 0',
            fontSize: 'clamp(1rem,2.5vw,1.4rem)',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '0 0 20px #00ff41,0 0 40px #00ff4180',
            letterSpacing: '0.15em',
          }}
        >
          {'★★★  ACCESS GRANTED  ★★★'}
        </div>
        <div ref={rootRef} style={{ color: '#9ece6a', opacity: 0, margin: '3px 0', fontSize: 'clamp(0.65rem,1.8vw,0.85rem)' }}>
          {'root@dfanso.dev:~# whoami'}
        </div>
        <div ref={rootResultRef} style={{ color: '#c0caf5', opacity: 0, margin: '3px 0', fontSize: 'clamp(0.65rem,1.8vw,0.85rem)' }}>
          {'root'}
        </div>
        <div ref={lol1Ref} style={{ color: '#9ece6a', opacity: 0, margin: '3px 0', fontSize: 'clamp(0.65rem,1.8vw,0.85rem)' }}>
          {'root@dfanso.dev:~# cat /etc/secrets'}
        </div>
        <div ref={lol2Ref} style={{ color: '#f7768e', opacity: 0, margin: '3px 0', fontSize: 'clamp(0.65rem,1.8vw,0.85rem)' }}>
          {'cat: /etc/secrets: nice try 😄'}
        </div>
        <div
          ref={lol3Ref}
          style={{
            color: '#a9b1d6',
            opacity: 0,
            margin: '3px 0',
            fontSize: 'clamp(0.65rem,1.8vw,0.85rem)',
            fontStyle: 'italic',
          }}
        >
          {'> jk — this is just a portfolio. but the animations are real 🔥'}
        </div>
        <div
          ref={exitHintRef}
          style={{
            color: '#00ff4140',
            opacity: 0,
            margin: '3px 0',
            fontSize: 'clamp(0.65rem,1.8vw,0.85rem)',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          [ click anywhere or press ESC to exit ]
        </div>
      </div>
    </div>
  )
}
