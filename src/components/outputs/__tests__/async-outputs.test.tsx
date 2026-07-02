// @vitest-environment jsdom
/**
 * Regression coverage for the async-output reveal bug class (`time`
 * permanently stuck at `--:--:--`; the earlier `github` fix for the same
 * bug class). See `CommandDef.async` in `commands.tsx` and the reveal-skip
 * check in `Terminal.tsx`'s `CommandBlock`.
 *
 * Kept out of `src/lib/__tests__` (which runs under the default `node`
 * environment — see vite.config.ts) via the `// @vitest-environment jsdom`
 * pragma above, so these are the only tests in the suite that render React
 * components and touch the DOM.
 *
 * Does NOT import `Terminal.tsx`: `CommandBlock` isn't exported, and the
 * module also declares `React.lazy(() => import('../effects/MatrixOverlay'))`
 * / `HackOverlay` at module scope, which drags in more than this test needs.
 * `commands.tsx` and `TimeOutput.tsx` are safe to import directly — neither
 * touches `@tanstack/react-start` (which vite.config.ts's `isVitest` guard
 * disables the plugins for).
 */
import { describe, it, expect, afterEach } from 'vitest'
import { useEffect, useRef, useState } from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { findCommand } from '../../../lib/commands'
import { useOutputReveal } from '../../../lib/useOutputReveal'
import { TimeOutput } from '../TimeOutput'

afterEach(() => {
  cleanup()
})

describe('TimeOutput', () => {
  it('eventually renders a real time string, not the --:--:-- placeholder', async () => {
    const { container } = render(<TimeOutput />)

    // `render`'s implicit `act()` already flushes the post-mount effect that
    // reads the real clock, but await a tick too so this doesn't depend on
    // that implementation detail.
    await act(async () => {})

    expect(container.textContent).not.toBe('--:--:--')
    expect(container.textContent).toMatch(/\d/)
  })
})

describe('registry contract', () => {
  it('marks time and github as async (own post-mount state)', () => {
    expect(findCommand('time')?.async).toBe(true)
    expect(findCommand('github')?.async).toBe(true)
  })

  it('does not mark synchronous outputs as async', () => {
    expect(findCommand('about')?.async).toBeFalsy()
    expect(findCommand('whoami')?.async).toBeFalsy()
  })
})

// A minimal harness standing in for `CommandBlock`: a ref'd wrapper div
// (`useOutputReveal`'s target, matching `.command-output` in Terminal.tsx)
// around a single child that flips its own text from a placeholder to a
// "real" value in a post-mount effect — the same shape as `TimeOutput`
// (one child element, well under the reveal hook's 100-char char-by-char
// threshold) and `GitHubStats` (async state transition owned by the child,
// independent of the parent's mount-only reveal effect).
function AsyncChild() {
  const [text, setText] = useState('--:--:--')
  useEffect(() => {
    setText('12:34:56')
  }, [])
  return <div>{text}</div>
}

function AsyncHarness({ disabled }: { disabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useOutputReveal(ref, { disabled })
  return (
    <div ref={ref}>
      <AsyncChild />
    </div>
  )
}

describe('useOutputReveal disabled option (async-output regression)', () => {
  // This is the regression test for the bug class: `disabled: true` (which
  // `CommandBlock` now derives from `CommandDef.async` instead of a
  // hardcoded `componentName === 'github'` check) must leave the child's
  // own async DOM commit alone rather than the reveal's char-by-char branch
  // snapshotting/clearing/retyping/restoring stale markup over it.
  it('disabled: true leaves a later async commit untouched', async () => {
    const { container } = render(<AsyncHarness disabled={true} />)

    await act(async () => {})

    expect(container.textContent).toBe('12:34:56')
  })
})

// A `disabled: false` counterpart that asserts the reveal actually clobbers
// the async commit (proving the harness exercises a real race, not a inert
// one) was tried and dropped: reproducing it needs the child's state update
// to land strictly *after* the reveal effect's synchronous DOM snapshot —
// true in a browser (paint-yield between effects), but `@testing-library`'s
// `act()` batches a synchronous `setState`-in-effect's resulting re-render
// before the next sibling effect runs, and once deferred through a
// microtask/timer instead, whether it reproduces became a function of
// exactly how the wait was wrapped relative to `act()` (see git history of
// this file) rather than of the hook's own logic — i.e. it was testing
// `act()`'s internals, not `useOutputReveal`. Forcing it deterministic would
// need mocking React's scheduler, which is the "excessive mocking" this
// task says to avoid. The `disabled: true` assertion above, plus the live
// CDP check in the task report, cover the real behavior.
