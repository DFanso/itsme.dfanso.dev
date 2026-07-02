import { describe, it, expect } from 'vitest'
import { getSuggestions, completeInput, navigateHistory, suggestClosest } from '../input-helpers'

const names = ['help', 'hack', 'whoami', 'weather', 'clear']

describe('getSuggestions', () => {
  it('matches by prefix, case-insensitive', () =>
    expect(getSuggestions('He', names)).toEqual(['help']))
  it('returns empty for empty input', () =>
    expect(getSuggestions('', names)).toEqual([]))
  it('excludes exact match', () =>
    expect(getSuggestions('help', names)).toEqual([]))
})

describe('completeInput', () => {
  it('completes unique prefix', () => expect(completeInput('wh', names)).toBe('whoami'))
  it('returns null when ambiguous', () => expect(completeInput('h', names)).toBeNull())
  it('returns null when no match', () => expect(completeInput('zz', names)).toBeNull())
})

describe('navigateHistory', () => {
  const h = ['ls', 'help', 'clear']
  it('up moves back', () => expect(navigateHistory(h, 3, 'up')).toEqual({ index: 2, value: 'clear' }))
  it('up stops at 0', () => expect(navigateHistory(h, 0, 'up')).toEqual({ index: 0, value: 'ls' }))
  it('down past end clears', () => expect(navigateHistory(h, 2, 'down')).toEqual({ index: 3, value: '' }))
})

describe('suggestClosest', () => {
  it('suggests near miss', () => expect(suggestClosest('hepl', names)).toBe('help'))
  it('null when nothing close', () => expect(suggestClosest('xyzzy', names)).toBeNull())
})
