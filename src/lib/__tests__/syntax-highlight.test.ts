import { describe, it, expect } from 'vitest'
import { highlightSegments } from '../syntax-highlight'

describe('highlightSegments', () => {
  it('highlights error words', () =>
    expect(highlightSegments('build failed today')).toContainEqual({
      text: 'failed',
      className: 'syntax-error',
    }))

  it('highlights urls', () =>
    expect(highlightSegments('see https://x.dev now').some((s) => s.className === 'syntax-link')).toBe(
      true,
    ))

  it('passes plain text through', () =>
    expect(highlightSegments('hello world')).toEqual([{ text: 'hello world' }]))

  it('handles multiple matches in one line, in order', () =>
    expect(highlightSegments('error then warning then success')).toEqual([
      { text: 'error', className: 'syntax-error' },
      { text: ' then ' },
      { text: 'warning', className: 'syntax-warning' },
      { text: ' then ' },
      { text: 'success', className: 'syntax-success' },
    ]))

  it('is case-insensitive and preserves original casing in the matched segment', () =>
    expect(highlightSegments('ERROR: Something happened')).toContainEqual({
      text: 'ERROR',
      className: 'syntax-error',
    }))

  it('highlights flags, paths, and commands', () => {
    const segments = highlightSegments('git ls -la ~/portfolio')
    expect(segments).toContainEqual({ text: 'git', className: 'syntax-command' })
    expect(segments).toContainEqual({ text: 'ls', className: 'syntax-command' })
    expect(segments).toContainEqual({ text: '-la', className: 'syntax-flag' })
    expect(segments).toContainEqual({ text: '~/portfolio', className: 'syntax-path' })
  })

  it('matches a whole line with a single trailing segment when nothing else follows', () =>
    expect(highlightSegments('done')).toEqual([{ text: 'done', className: 'syntax-success' }]))
})
