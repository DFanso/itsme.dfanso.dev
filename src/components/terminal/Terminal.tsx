import type React from 'react'
import { Fragment, lazy, memo, Suspense, useEffect, useRef, useState } from 'react'
import { useTerminal } from '../../lib/useTerminal'
import { useIdleTimer } from '../../lib/useIdleTimer'
import { useOutputReveal } from '../../lib/useOutputReveal'
import { useBootSequence } from '../../lib/useBootSequence'
import { findCommand, type Execution } from '../../lib/commands'
import { highlightSegments } from '../../lib/syntax-highlight'
import type { Block } from '../../lib/terminal-reducer'
import { Prompt } from './Prompt'
import { TitleBar } from './TitleBar'
import { InputLine } from './InputLine'
import { ShutdownScreen } from './ShutdownScreen'
import { CopyButton } from './CopyButton'

// Lazy-loaded (code-split) easter-egg overlays — only fetched when the user
// actually types `matrix` or `hack`. Must be declared at module scope (not
// inside the component) so `lazy()` isn't re-invoked on every render.
const MatrixOverlay = lazy(() =>
  import('../effects/MatrixOverlay').then((m) => ({ default: m.MatrixOverlay })),
)
const HackOverlay = lazy(() => import('../effects/HackOverlay').then((m) => ({ default: m.HackOverlay })))

// Ported from the old site's `isTouchDevice` (index.astro:976-978,
// accessibility pass commit 3d056be) — used to skip auto-focusing the
// (invisible) input on touch devices, which would otherwise pop the soft
// keyboard open the instant the page loads or the user taps anywhere in the
// terminal. `typeof window === 'undefined'` guards SSR, where there's no
// pointer to query and no keyboard to avoid popping anyway.
function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches
}

// Composes the terminal shell: TitleBar + echoed command blocks + the live
// InputLine + footer + ShutdownScreen. Ported from
// src-astro/pages/index.astro:17-361 (markup) and the `Terminal` class'
// window-control / click-to-focus / auto-scroll behavior
// (index.astro:421-736).

// Renders a plain string as syntax-highlighted spans (index.astro:388-396
// patterns, applied by `highlightSegments`) instead of the old site's
// innerHTML-based DOM mutation. Unmatched runs render as plain text (no
// wrapping span) via a keyed Fragment.
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {highlightSegments(text).map((segment, index) =>
        segment.className ? (
          <span key={index} className={segment.className}>
            {segment.text}
          </span>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        ),
      )}
    </>
  )
}

// Block output switches on `Execution.kind` (never `CommandDef.kind`, see
// Task 5's forward note): `component` looks up the registered command's
// `Output`; `text` and `action` both render `execution.text` (a colored
// list of lines) when present, and nothing otherwise. `component` outputs
// (Ls, Whoami, etc.) are hand-built JSX with their own styling, so — unlike
// the old site, which highlighted every rendered text node indiscriminately
// — syntax highlighting here only applies to the plain-string `text.lines`.
function BlockOutput({ execution }: { execution: Execution }) {
  if (execution.kind === 'component') {
    const Output = findCommand(execution.componentName ?? '')?.Output
    return Output ? <Output /> : null
  }

  if (execution.text) {
    return (
      <div className={execution.text.color}>
        {execution.text.lines.map((line, index) => (
          <div key={index}>
            <Highlighted text={line} />
          </div>
        ))}
      </div>
    )
  }

  return null
}

// One echoed command + its output. Memoized (compared by block id, which is
// stable and never reused for a different block — see `terminal-reducer`)
// so that once a block mounts it never re-renders, no matter how many times
// the parent `Terminal` re-renders while the user keeps working (typing,
// history navigation, etc.). That's required for `useOutputReveal`'s
// mount-only DOM reveal (char-by-char typing, `.typing-line` stagger, the
// `ls` anime sequence) to actually run once and never be re-triggered or
// clobbered by React reconciling this subtree again.
//
// Commands registered with `async: true` (see `CommandDef` in commands.tsx)
// are excluded from the reveal even though `CommandBlock` itself never
// re-renders: their `Output` owns its own post-mount `useState` transition
// (e.g. `GitHubStats` fetches client-side via `getGitHubStats`; `TimeOutput`
// reads the clock in a `useEffect`), unlike most `Output`s, which render
// synchronously from static data — their subtree re-renders on its own
// schedule regardless of the memo above. The reveal's char-by-char typing
// branch directly clears and mutates `el.innerHTML`/`textContent` outside
// React — if that races an async output's own re-render, React's next
// commit either tries to remove DOM nodes the hook already ripped out from
// under it (throwing `NotFoundError: Failed to execute 'removeChild' on
// 'Node'` and tripping the route's error boundary) or has its committed text
// silently overwritten by the hook's saved/restored placeholder markup (the
// `time` command's stuck `--:--:--` bug). Skipping the reveal for these
// outputs keeps the DOM entirely React-owned, which each async output's own
// loading/placeholder state already communicates visually.
const CommandBlock = memo(
  function CommandBlock({ block }: { block: Block }) {
    const outputRef = useRef<HTMLDivElement>(null)
    const def = block.execution.componentName ? findCommand(block.execution.componentName) : undefined
    const revealDisabled = !!block.seeded || !!def?.async
    useOutputReveal(outputRef, { disabled: revealDisabled })

    return (
      <div className="command-block">
        <Prompt>
          {!block.seeded && (
            <span className="command-text">
              <Highlighted text={block.command} />
            </span>
          )}
        </Prompt>
        <div className="command-output" ref={outputRef}>
          <BlockOutput execution={block.execution} />
        </div>
      </div>
    )
  },
  (prev, next) => prev.block.id === next.block.id,
)

export function Terminal() {
  const { state, overlayVisible, dispatch, submit, closeOverlay, shutdown, reboot, toggleMaximize } = useTerminal()
  useIdleTimer()
  useBootSequence()

  const contentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [minimizing, setMinimizing] = useState(false)

  // Initial focus (index.astro:591-592) — skipped on touch devices so the
  // soft keyboard doesn't pop open uninvited on page load (accessibility
  // pass, commit 3d056be).
  useEffect(() => {
    if (isTouchDevice()) return
    inputRef.current?.focus()
  }, [])

  // Auto-scroll to bottom whenever a new block is appended
  // (index.astro:735, `this.terminal.scrollTop = this.terminal.scrollHeight`).
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [state.blocks.length])

  // Close plays a 300ms fade before the shutdown screen replaces the
  // terminal (index.astro:430-436).
  useEffect(() => {
    if (!closing) return
    const timer = window.setTimeout(() => shutdown(), 300)
    return () => window.clearTimeout(timer)
  }, [closing, shutdown])

  // Minimize is a 200ms visual dip, then reverts (index.astro:479-484).
  useEffect(() => {
    if (!minimizing) return
    const timer = window.setTimeout(() => setMinimizing(false), 200)
    return () => window.clearTimeout(timer)
  }, [minimizing])

  function handleClose() {
    setClosing(true)
  }

  function handleReboot() {
    setClosing(false)
    reboot()
  }

  function handleMinimize() {
    setMinimizing(true)
  }

  // Click anywhere in the terminal (not a link, not a suggestion) focuses
  // the input and dismisses the suggestions box (index.astro:542-549).
  //
  // Extended by the accessibility pass (commit 3d056be) with two behaviors,
  // merged into this single delegated handler rather than the old site's two
  // separate listeners (`initializeCommandTriggers` + `initializeTerminal`,
  // index.astro:892-999) since React only needs one `onClick` on `#terminal`:
  //  - `[data-command-trigger]` (the tappable `ls`/`help` entries rendered by
  //    Ls.tsx/Help.tsx) runs that command instead of focusing the input —
  //    this is the "cleanest minimal approach" the task called for: no new
  //    context/event-bus, just the same click-delegation the terminal
  //    container already had, extended with one more `closest()` check.
  //  - On touch devices, only focus (and pop the soft keyboard) when the tap
  //    landed on the input row itself, not anywhere else in the terminal.
  function handleTerminalClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement

    const trigger = target.closest('[data-command-trigger]') as HTMLElement | null
    if (trigger) {
      const cmd = trigger.dataset.commandTrigger
      setSuggestionsVisible(false)
      if (cmd) submit(cmd)
      return
    }

    if (target.closest('.suggestions-container') || target.closest('a')) return

    setSuggestionsVisible(false)
    if (isTouchDevice() && !target.closest('#input-line')) return
    inputRef.current?.focus()
  }

  // Maximize toggles the same 6 classes the old site toggled
  // (index.astro:469-476). `w-full` is already present on the base
  // container, so — matching `classList.toggle` semantics exactly — it's the
  // one class that's *removed* on maximize and restored on un-maximize,
  // while the other five are added/removed the "normal" way.
  const containerClassName = [
    'terminal-container',
    state.maximized ? '' : 'w-full',
    'max-w-[1400px] shadow-2xl border border-[#7aa2f7]/20 rounded overflow-hidden flex flex-col',
    state.maximized ? 'max-w-6xl h-full max-w-full rounded-none m-0' : '',
    closing ? 'opacity-0 scale-95' : '',
    minimizing ? 'translate-y-4 opacity-80' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div className={containerClassName}>
        <TitleBar
          maximized={state.maximized}
          onClose={handleClose}
          onMinimize={handleMinimize}
          onMaximize={toggleMaximize}
        />

        <div
          id="terminal"
          className="terminal-content-area flex-1 relative"
          role="region"
          aria-label="Interactive terminal portfolio"
          onClick={handleTerminalClick}
          ref={contentRef}
        >
          <div id="output-container" role="log" aria-live="polite" aria-atomic="false">
            {state.blocks.map((block) => (
              <CommandBlock block={block} key={block.id} />
            ))}
          </div>

          <InputLine
            history={state.history}
            dispatch={dispatch}
            onSubmit={submit}
            inputRef={inputRef}
            terminalRef={contentRef}
            suggestionsVisible={suggestionsVisible}
            setSuggestionsVisible={setSuggestionsVisible}
            awaitingProjectResponse={state.awaitingProjectResponse}
          />
        </div>

        <div className="terminal-footer shrink-0 p-2 text-center bg-[#1a1b26] border-t border-[#7aa2f7]/10">
          <p className="text-[10px] sm:text-xs text-[#7aa2f7]">
            Made with <span className="text-[#f7768e]">❤</span> by DFanso
          </p>
        </div>
      </div>

      <ShutdownScreen visible={state.shutdown} onReboot={handleReboot} />
      <CopyButton containerRef={contentRef} />

      {overlayVisible && state.overlay === 'matrix' && (
        <Suspense fallback={null}>
          <MatrixOverlay onExit={closeOverlay} />
        </Suspense>
      )}
      {overlayVisible && state.overlay === 'hack' && (
        <Suspense fallback={null}>
          <HackOverlay onExit={closeOverlay} />
        </Suspense>
      )}
    </>
  )
}
