import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Prompt } from './Prompt'
import { Suggestions } from './Suggestions'
import { COMMAND_NAMES } from '../../lib/commands'
import { getSuggestions, completeInput, navigateHistory } from '../../lib/input-helpers'
import type { TerminalAction } from '../../lib/terminal-reducer'

// Ported from src-astro/pages/index.astro:66-79 (markup) and the
// `initializeTerminal`/`handleTabCompletion`/`handleArrowUp`/`handleArrowDown`
// methods (index.astro:540-589, 601-614, 886-920, behavior).
//
// `historyIndex` resets to `history.length` whenever the `history` array
// reference changes (i.e. after a non-empty submit pushes onto it) — that
// mirrors the old site only reassigning `this.historyIndex = this.commandHistory.length`
// in the non-empty branch of `handleEnter` (index.astro:721-722); empty
// submits never touch `commandHistory`, so the array reference — and thus
// this effect — doesn't fire for them either.
//
// Suggestion visibility is lifted to the parent (`Terminal`) so a click
// anywhere else in the terminal can dismiss it, matching the old
// `terminal.addEventListener('click', ...)` guard (index.astro:542-549).

interface InputLineProps {
  history: string[]
  dispatch: React.Dispatch<TerminalAction>
  onSubmit: (raw: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  terminalRef: React.RefObject<HTMLDivElement | null>
  suggestionsVisible: boolean
  setSuggestionsVisible: (visible: boolean) => void
}

export function InputLine({
  history,
  dispatch,
  onSubmit,
  inputRef,
  terminalRef,
  suggestionsVisible,
  setSuggestionsVisible,
}: InputLineProps) {
  const [value, setValue] = useState('')
  const [historyIndex, setHistoryIndex] = useState(history.length)
  const inputLineRef = useRef<HTMLDivElement>(null)
  const [suggestionStyle, setSuggestionStyle] = useState<React.CSSProperties | undefined>(undefined)

  const items = suggestionsVisible ? getSuggestions(value, COMMAND_NAMES) : []

  // Reset history navigation whenever a non-empty command actually lands in
  // history (see comment above on why empty submits leave this untouched).
  useEffect(() => {
    setHistoryIndex(history.length)
  }, [history])

  // Position the suggestions box below the input line, relative to the
  // terminal content area — same relationship as the old site's
  // `inputRect.bottom - terminalRect.top` / `inputRect.left - terminalRect.left`
  // (index.astro:522-526), just computed in React instead of vanilla DOM.
  useEffect(() => {
    if (items.length === 0) {
      setSuggestionStyle(undefined)
      return
    }
    const inputLineEl = inputLineRef.current
    const terminalEl = terminalRef.current
    if (!inputLineEl || !terminalEl) return

    const inputRect = inputLineEl.getBoundingClientRect()
    const terminalRect = terminalEl.getBoundingClientRect()
    setSuggestionStyle({
      top: inputRect.bottom - terminalRect.top,
      left: inputRect.left - terminalRect.left,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, value, terminalRef])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
    setSuggestionsVisible(true)
  }

  function handlePick(command: string) {
    setValue(command)
    setSuggestionsVisible(false)
    inputRef.current?.focus()
  }

  function submitValue() {
    onSubmit(value)
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const completed = completeInput(value, COMMAND_NAMES)
      if (completed !== null) {
        setValue(completed)
        setSuggestionsVisible(false)
      } else {
        setSuggestionsVisible(true)
      }
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault()
      dispatch({ type: 'clear' })
      return
    }

    if (e.key === 'Enter') {
      setSuggestionsVisible(false)
      submitValue()
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const result = navigateHistory(history, historyIndex, 'up')
      setHistoryIndex(result.index)
      setValue(result.value)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const result = navigateHistory(history, historyIndex, 'down')
      setHistoryIndex(result.index)
      setValue(result.value)
    }
  }

  return (
    <div className="command-block" id="input-line" ref={inputLineRef}>
      <Prompt>
        <span className="command-text">{value}</span>
        <span className="cursor" />
        <input
          ref={inputRef}
          type="text"
          id="terminal-input"
          className="opacity-0 absolute top-0 left-0 h-full w-full cursor-text"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </Prompt>
      <Suggestions items={items} input={value} onPick={handlePick} style={suggestionStyle} />
    </div>
  )
}
