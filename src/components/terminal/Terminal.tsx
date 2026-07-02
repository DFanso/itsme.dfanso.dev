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
const CommandBlock = memo(
  function CommandBlock({ block }: { block: Block }) {
    const outputRef = useRef<HTMLDivElement>(null)
    useOutputReveal(outputRef, { disabled: !!block.seeded })

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

  // Initial focus (index.astro:591-592).
  useEffect(() => {
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
  function handleTerminalClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    if (!target.closest('.suggestions-container') && !target.closest('a')) {
      setSuggestionsVisible(false)
      inputRef.current?.focus()
    }
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
        <TitleBar onClose={handleClose} onMinimize={handleMinimize} onMaximize={toggleMaximize} />

        <div
          id="terminal"
          className="terminal-content-area flex-1 relative"
          onClick={handleTerminalClick}
          ref={contentRef}
        >
          <div id="output-container" aria-live="polite">
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
