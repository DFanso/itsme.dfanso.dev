import { describe, it, expect } from 'vitest'
import { terminalReducer, initialState } from '../terminal-reducer'

describe('terminalReducer', () => {
  it('seeds welcome + whoami', () => {
    expect(initialState.blocks.map(b => b.command)).toEqual(['welcome', 'whoami'])
  })
  it('submit appends block and history', () => {
    const s = terminalReducer(initialState, { type: 'submit', raw: 'about' })
    expect(s.blocks.at(-1)!.command).toBe('about')
    expect(s.history).toEqual(['about'])
  })
  it('empty submit adds block but not history', () => {
    const s = terminalReducer(initialState, { type: 'submit', raw: '   ' })
    expect(s.blocks.length).toBe(initialState.blocks.length + 1)
    expect(s.history).toEqual([])
  })
  it('clear empties blocks, keeps history', () => {
    let s = terminalReducer(initialState, { type: 'submit', raw: 'about' })
    s = terminalReducer(s, { type: 'submit', raw: 'clear' })
    expect(s.blocks).toEqual([])
    expect(s.history).toEqual(['about', 'clear'])
  })
  it('projects → y flow', () => {
    let s = terminalReducer(initialState, { type: 'submit', raw: 'projects' })
    expect(s.awaitingProjectResponse).toBe(true)
    s = terminalReducer(s, { type: 'submit', raw: 'y' })
    expect(s.awaitingProjectResponse).toBe(false)
  })
  it('matrix sets overlay; overlay-closed clears it', () => {
    let s = terminalReducer(initialState, { type: 'submit', raw: 'matrix' })
    expect(s.overlay).toBe('matrix')
    s = terminalReducer(s, { type: 'overlay-closed' })
    expect(s.overlay).toBeNull()
  })
  it('reboot restores initial state', () => {
    let s = terminalReducer(initialState, { type: 'shutdown' })
    expect(s.shutdown).toBe(true)
    s = terminalReducer(s, { type: 'reboot' })
    expect(s).toEqual(initialState)
  })
})
