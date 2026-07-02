import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTerminal } from '../../lib/useTerminal'
import { useIdleTimer } from '../../lib/useIdleTimer'
import { findCommand, type Execution } from '../../lib/commands'
import { Prompt } from './Prompt'
import { TitleBar } from './TitleBar'
import { InputLine } from './InputLine'
import { ShutdownScreen } from './ShutdownScreen'
import { CopyButton } from './CopyButton'

// Composes the terminal shell: TitleBar + echoed command blocks + the live
// InputLine + footer + ShutdownScreen. Ported from
// src-astro/pages/index.astro:17-361 (markup) and the `Terminal` class'
// window-control / click-to-focus / auto-scroll behavior
// (index.astro:421-736).

// Block output switches on `Execution.kind` (never `CommandDef.kind`, see
// Task 5's forward note): `component` looks up the registered command's
// `Output`; `text` and `action` both render `execution.text` (a colored
// list of lines) when present, and nothing otherwise.
function BlockOutput({ execution }: { execution: Execution }) {
  if (execution.kind === 'component') {
    const Output = findCommand(execution.componentName ?? '')?.Output
    return Output ? <Output /> : null
  }

  if (execution.text) {
    return (
      <div className={execution.text.color}>
        {execution.text.lines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    )
  }

  return null
}

export function Terminal() {
  const { state, dispatch, submit, shutdown, reboot, toggleMaximize } = useTerminal()
  useIdleTimer()

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
              <div className="command-block" key={block.id}>
                <Prompt>
                  <span className="command-text">{block.command}</span>
                </Prompt>
                <div className="command-output">
                  <BlockOutput execution={block.execution} />
                </div>
              </div>
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
    </>
  )
}
