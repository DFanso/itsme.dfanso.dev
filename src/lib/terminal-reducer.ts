/**
 * Pure state + reducer for the terminal UI.
 *
 * Wraps `executeLine` (Task 5) and turns each submitted line into a `Block`
 * that gets appended to `blocks`. Mirrors the imperative DOM logic in
 * src-astro/pages/index.astro:
 *  - initial blocks seeded with `welcome` + `whoami` (index.astro:33-63)
 *  - `reboot` clears everything and reseeds `welcome` + `whoami`
 *    (index.astro:438-466)
 *  - `clear` empties the block list but the `clear` command itself still
 *    lands in `history` (index.astro:739-880 dispatch logic)
 *
 * All side effects (window.open, the 300ms theatrical overlay delay) live
 * in `useTerminal.ts`, not here — the reducer only sets state synchronously.
 */
import { executeLine, type Execution } from './commands'

export interface Block {
  id: number
  /** Trimmed, original-case input as submitted (not lowercased). */
  command: string
  execution: Execution
}

export interface TerminalState {
  blocks: Block[]
  history: string[] // submitted non-empty commands
  awaitingProjectResponse: boolean
  overlay: 'matrix' | 'hack' | null
  shutdown: boolean
  maximized: boolean
  nextId: number
}

export type TerminalAction =
  | { type: 'submit'; raw: string; rand?: number }
  | { type: 'clear' } // also Ctrl+L
  | { type: 'overlay-closed' }
  | { type: 'shutdown' }
  | { type: 'reboot' }
  | { type: 'toggle-maximize' }

function seedBlock(command: string, id: number): Block {
  return { id, command, execution: { kind: 'component', componentName: command } }
}

export const initialState: TerminalState = {
  blocks: [seedBlock('welcome', 0), seedBlock('whoami', 1)],
  history: [],
  awaitingProjectResponse: false,
  overlay: null,
  shutdown: false,
  maximized: false,
  nextId: 2,
}

function appendBlock(state: TerminalState, command: string, execution: Execution): TerminalState {
  const block: Block = { id: state.nextId, command, execution }
  return { ...state, blocks: [...state.blocks, block], nextId: state.nextId + 1 }
}

function submit(state: TerminalState, raw: string, rand?: number): TerminalState {
  const trimmed = raw.trim()
  const execution = executeLine(raw, { awaitingProjectResponse: state.awaitingProjectResponse, rand })

  let next: TerminalState = {
    ...state,
    history: trimmed ? [...state.history, trimmed.toLowerCase()] : state.history,
    awaitingProjectResponse: execution.awaitProjectResponse ?? false,
  }

  if (execution.action === 'clear') {
    // The clear command itself does not remain as a block, but it did
    // already get recorded in history above.
    return { ...next, blocks: [] }
  }

  next = appendBlock(next, trimmed, execution)

  if (execution.action === 'matrix' || execution.action === 'hack') {
    next = { ...next, overlay: execution.action }
  }

  return next
}

export function terminalReducer(state: TerminalState, action: TerminalAction): TerminalState {
  switch (action.type) {
    case 'submit':
      return submit(state, action.raw, action.rand)
    case 'clear':
      return { ...state, blocks: [] }
    case 'overlay-closed':
      return { ...state, overlay: null }
    case 'shutdown':
      return { ...state, shutdown: true }
    case 'reboot':
      return initialState
    case 'toggle-maximize':
      return { ...state, maximized: !state.maximized }
    default:
      return state
  }
}
