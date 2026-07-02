/**
 * Thin `useReducer` wrapper around `terminalReducer` that layers in the two
 * side effects the pure reducer intentionally leaves out:
 *
 *  - `open-resume` → `window.open('/resume.pdf', '_blank')`
 *    (index.astro's `resume` command handler)
 *  - `matrix` / `hack` → the reducer already flips `state.overlay`
 *    synchronously (so any state-driven UI can react immediately), but the
 *    old site had a ~300ms "theatrical" pause before the full-screen
 *    takeover actually appeared. That's reproduced here as `overlayVisible`,
 *    a boolean that lags `state.overlay` by 300ms. Design choice: rather
 *    than threading the delay through the reducer (which would make it
 *    impure/untestable), the hook derives `overlayVisible` from
 *    `state.overlay` via a `setTimeout` effect. Consumers should gate the
 *    full-screen overlay markup on `overlayVisible`, not `state.overlay`.
 *
 * Effects are guarded to run once per relevant change (latest block id for
 * the resume side effect; `state.overlay` identity for the reveal delay)
 * and are no-ops during SSR (`typeof window === 'undefined'`).
 */
import type React from 'react'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { terminalReducer, initialState } from './terminal-reducer'
import type { TerminalState, TerminalAction } from './terminal-reducer'

export interface UseTerminalResult {
  state: TerminalState
  /** `state.overlay` delayed by 300ms to mirror the old site's launch pause. */
  overlayVisible: boolean
  dispatch: React.Dispatch<TerminalAction>
  submit: (raw: string) => void
  clear: () => void
  closeOverlay: () => void
  shutdown: () => void
  reboot: () => void
  toggleMaximize: () => void
}

export function useTerminal(): UseTerminalResult {
  const [state, dispatch] = useReducer(terminalReducer, initialState)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const lastHandledBlockId = useRef<number | null>(null)

  // `open-resume` fires window.open once per newly appended block. Guarded
  // by block id so it doesn't refire on unrelated re-renders.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const latest = state.blocks.at(-1)
    if (!latest || latest.id === lastHandledBlockId.current) return
    lastHandledBlockId.current = latest.id

    if (latest.execution.action === 'open-resume') {
      window.open('/resume.pdf', '_blank')
    }
  }, [state.blocks])

  // Reveal the matrix/hack overlay 300ms after the reducer sets it; hide
  // immediately (no delay) when it's cleared.
  useEffect(() => {
    if (typeof window === 'undefined') return
    setOverlayVisible(false)
    if (!state.overlay) return

    const timer = window.setTimeout(() => setOverlayVisible(true), 300)
    return () => window.clearTimeout(timer)
  }, [state.overlay])

  const submit = useCallback((raw: string) => dispatch({ type: 'submit', raw, rand: Math.random() }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])
  const closeOverlay = useCallback(() => dispatch({ type: 'overlay-closed' }), [])
  const shutdown = useCallback(() => dispatch({ type: 'shutdown' }), [])
  const reboot = useCallback(() => dispatch({ type: 'reboot' }), [])
  const toggleMaximize = useCallback(() => dispatch({ type: 'toggle-maximize' }), [])

  return {
    state,
    overlayVisible,
    dispatch,
    submit,
    clear,
    closeOverlay,
    shutdown,
    reboot,
    toggleMaximize,
  }
}
