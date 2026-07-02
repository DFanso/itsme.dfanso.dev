# Astro → TanStack Start Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the terminal-themed portfolio (itsme.dfanso.dev) as a TanStack Start React app with identical content/behavior plus agreed improvements, then remove Astro.

**Architecture:** Fresh TanStack Start scaffold on a branch; old Astro source parked at `src-astro/` as the porting reference; a command registry + reducer replaces the 1,600-line inline terminal script; `/` and `/resume` are prerendered; GitHub stats move to an on-demand server function.

**Tech Stack:** TanStack Start (`@tanstack/react-start` + `@tanstack/react-router`), React 19, TypeScript, Vite, Nitro (Vercel preset auto-detected), Tailwind CSS v4 (`@tailwindcss/vite`), animejs v3 (kept), unplugin-icons + existing `@iconify-json/*`, Vitest, yarn.

**Spec:** `docs/superpowers/specs/2026-07-02-astro-to-tanstack-start-migration-design.md`

## Global Constraints

- Package manager: **yarn** (yarn 1.22 — `yarn add`, `yarn remove`). Never npm/pnpm.
- Branch: all work on `migrate/tanstack-start`.
- The old Astro app lives at `src-astro/` from Task 1 onward. **It is the authoritative reference** — when a task says "port `src-astro/components/X.astro`", the markup/classes/copy must be preserved exactly unless the task lists an explicit improvement.
- Astro→React conversion rules (apply everywhere):
  - `class=` → `className=`; `<style is:global>` blocks → `src/styles/app.css`; component `<style>` blocks → co-located CSS or `app.css` (keep selector names).
  - astro-icon `<Icon name="mdi:github" class="w-4" />` → `import IMdiGithub from '~icons/mdi/github'` then `<IMdiGithub className="w-4" />` (unplugin-icons).
  - Astro frontmatter data access stays: `import { portfolio } from '../data/portfolio'` (file is copied verbatim).
  - Keep every Tokyo Night hex class literally (`#7aa2f7`, `#9ece6a`, `#bb9af7`, `#f7768e`, `#e0af68`, `#565f89`, `#c0caf5`, `#1a1b26`, `#16161e`, `#24283b`).
- animejs stays at v3: `import anime from 'animejs/lib/anime.es.js'`.
- Every animation/listener/timer registered in an effect MUST be cleaned up in the effect's return.
- `prefers-reduced-motion: reduce` disables ambient/particle/CRT-flicker animations (guard with `window.matchMedia('(prefers-reduced-motion: reduce)').matches`).
- Tests: Vitest, colocated under `src/lib/__tests__/`. Run with `yarn test run`.
- Commit after every task (conventional commits, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`).
- Do not pin dependency versions from this plan — install latest with yarn and keep what the lockfile resolves.

---

### Task 1: Branch and park the Astro source

**Files:**
- Move: `src/` → `src-astro/`

**Interfaces:**
- Produces: `src-astro/**` — read-only porting reference for all later tasks.

- [ ] **Step 1: Create branch**

Run: `git checkout -b migrate/tanstack-start`
Expected: `Switched to a new branch 'migrate/tanstack-start'`

- [ ] **Step 2: Park Astro source**

Run: `git mv src src-astro && git commit -m "chore: park Astro source at src-astro for migration reference"`
Expected: clean commit; `git status` clean. (The Astro build is intentionally broken on this branch from here on.)

---

### Task 2: Scaffold TanStack Start + Tailwind v4 + Vitest

**Files:**
- Modify: `package.json` (scripts + deps)
- Create: `vite.config.ts`, `src/router.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/styles/app.css`
- Modify: `tsconfig.json`
- Delete: nothing yet (Astro config stays until teardown)

**Interfaces:**
- Produces: running app shell; `yarn dev`, `yarn build` (prerenders `/`), `yarn test run` all work. Route files convention: `src/routes/*.tsx` with `createFileRoute`.

- [ ] **Step 1: Install dependencies**

```bash
yarn add @tanstack/react-start @tanstack/react-router react@^19 react-dom@^19 nitro animejs@3.2.2 @vercel/analytics @vercel/speed-insights
yarn add -D vite @vitejs/plugin-react typescript @types/react @types/react-dom tailwindcss@^4 @tailwindcss/vite unplugin-icons @iconify-json/lucide @iconify-json/mdi @iconify-json/simple-icons vitest
```

Keep existing devDeps `@react-pdf/renderer`, `tsx`, `@types/animejs`. Do NOT remove astro deps yet.

- [ ] **Step 2: Replace package.json scripts**

```json
"scripts": {
  "dev": "vite dev",
  "build": "vite build",
  "start": "node .output/server/index.mjs",
  "test": "vitest",
  "generate:cv": "tsx scripts/generate-pdf.tsx"
}
```

(The `astro` and old `preview` scripts are removed; `copy-sitemaps.mjs` no longer runs — Task 14 replaces the sitemap.)

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    Icons({ compiler: 'jsx', jsx: 'react' }),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    viteReact(),
    nitro(),
  ],
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
  },
})
```

Add `/// <reference types="vitest/config" />` at top if TS complains about `test`.

- [ ] **Step 4: Update `tsconfig.json`**

Replace the Astro-extending config with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "types": ["vite/client", "unplugin-icons/types/react"]
  },
  "include": ["src", "scripts"],
  "exclude": ["src-astro", "dist", ".output", "node_modules"]
}
```

- [ ] **Step 5: Create `src/router.tsx`**

```tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
```

(If the installed `@tanstack/react-start` version requires a different export name — e.g. `createRouter` default export — follow the version's build-from-scratch doc; verify with `yarn dev`.)

- [ ] **Step 6: Create minimal `src/routes/__root.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import appCss from '../styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Leo Felcianas - DevOps Engineer & Software Developer' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body>
        <main className="relative h-full">{children}</main>
        <Scripts />
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Create `src/styles/app.css`**

```css
@import 'tailwindcss';
/* Global styles ported in Task 3 */
```

- [ ] **Step 8: Create placeholder `src/routes/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => <div className="text-[#7aa2f7] font-mono p-8">terminal coming soon</div>,
})
```

- [ ] **Step 9: Verify dev, build, test**

Run: `yarn dev` → page renders placeholder at localhost.
Run: `yarn build` → succeeds; prerendered `index.html` exists under the output dir.
Run: `yarn test run` → "No test files found" exit 0 (or passes trivially).

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: scaffold TanStack Start app with Tailwind v4 and Vitest"
```

---

### Task 3: Root document — meta, global styles, CRT overlay, 404

**Files:**
- Copy: `src-astro/data/portfolio.ts` → `src/data/portfolio.ts` (verbatim)
- Copy: `src-astro/assets/profile.webp` → `src/assets/profile.webp`
- Modify: `src/routes/__root.tsx`, `src/styles/app.css`
- Create: `src/components/effects/CrtOverlay.tsx`, `src/components/NotFound.tsx`

**Interfaces:**
- Consumes: Task 2 shell.
- Produces: `<CrtOverlay />` (self-contained, no props); `<NotFound />` (no props); full `head()` metadata identical to `src-astro/layouts/Layout.astro:27-148`.

- [ ] **Step 1: Port `Layout.astro` head into `__root.tsx` `head()`**

Source: `src-astro/layouts/Layout.astro:27-148`. Every meta/link/title becomes an entry in `head().meta` / `head().links`. JSON-LD Person + WebSite schemas go in `head().scripts` as `{ type: 'application/ld+json', children: JSON.stringify({...}) }` — copy the JSON objects verbatim (Person schema lines 89-108, WebSite schema lines 135-147). Include: google-site-verification, keywords, author, canonical (`https://itsme.dfanso.dev/`), favicon data-URI, manifest, theme-color, OG + Twitter tags (image `/og-image.svg`), robots, JetBrains Mono font preconnect + stylesheet links.

- [ ] **Step 2: Port body shell + global CSS**

Body classes from `Layout.astro:149`: `bg-[var(--bg)] text-[var(--text)] h-screen overflow-hidden font-mono selection:bg-[var(--primary)] selection:text-[var(--bg)]` (drop `no-js` — boot handling becomes React state in Task 12). Port the entire `<style is:global>` block (`Layout.astro:240-441`: `:root` palette vars, body aurora/noise pseudo-elements, keyframes, scrollbar, selection, CRT overlay styles, `#crt-poweron`) into `app.css` below the tailwind import. Also port `index.astro`'s `<style>` block (search for terminal styles at the end of `src-astro/pages/index.astro`, after the scripts): `.terminal-container`, `.terminal-title-bar`, `.terminal-button`, `.command-block`, `.cursor`, `.suggestions-container`, `.copy-button`, `.typing-line`, `.syntax-*` classes, etc.

- [ ] **Step 3: Create `CrtOverlay.tsx`**

Port the CRT markup (`Layout.astro:157-165`) and its anime.js script (`Layout.astro:169-236`) into one component: power-on timeline, rolling scanline loop, flicker loop. All in a `useEffect` with cleanup:

```tsx
import { useEffect, useRef } from 'react'
import anime from 'animejs/lib/anime.es.js'

export function CrtOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const poweronRef = useRef<HTMLDivElement>(null)
  const rollingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers: number[] = []
    let disposed = false
    // power-on timeline (Layout.astro:181-201) — skip if reduced, just hide poweron
    // rollScanline() and flicker() loops (Layout.astro:205-234): reschedule via
    // timers.push(window.setTimeout(...)); guard every callback with `if (disposed) return`
    return () => {
      disposed = true
      timers.forEach(clearTimeout)
      anime.remove([overlayRef.current, poweronRef.current, rollingRef.current])
    }
  }, [])
  // render #crt-overlay (scanlines/vignette/glare/rolling divs) + #crt-poweron with refs
}
```

Copy the anime parameter objects (durations, easings, opacities) verbatim from the source lines noted.

- [ ] **Step 4: Create `NotFound.tsx` + wire `notFoundComponent`**

Port the 404 UI from `src-astro/pages/[...any].astro` / `404.astro` (identical content: 404 heading, `find-page --url="not-found"` command-line box, Return Home button). Wire in `__root.tsx`: `notFoundComponent: () => <NotFound />`. SSR of an unknown path must return HTTP 404 (TanStack Start does this automatically for notFound).

- [ ] **Step 5: Add Vercel analytics**

In `RootDocument` body: `<Analytics />` from `@vercel/analytics/react` and `<SpeedInsights />` from `@vercel/speed-insights/react`, plus `<CrtOverlay />`.

- [ ] **Step 6: Verify**

Run: `yarn dev`. Check: fonts load, aurora background + CRT scanlines visible, power-on flash plays once, `/nonexistent` shows 404 page. Run `yarn build` → clean, prerender OK.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: port root document, global styles, CRT overlay and 404"
```

---

### Task 4: Input helpers (TDD)

**Files:**
- Create: `src/lib/input-helpers.ts`
- Test: `src/lib/__tests__/input-helpers.test.ts`

**Interfaces:**
- Produces:
  - `getSuggestions(input: string, names: string[]): string[]` — names starting with lowercased input, excluding exact match; `[]` for empty input.
  - `completeInput(input: string, names: string[]): string | null` — unique completion or null.
  - `navigateHistory(history: string[], index: number, dir: 'up' | 'down'): { index: number; value: string }` — mirrors `src-astro/pages/index.astro:886-909` semantics (up stops at 0; down past end yields `index = history.length`, `value = ''`).
  - `suggestClosest(input: string, names: string[]): string | null` — nearest name by Levenshtein distance, only if distance ≤ 2, else null (new "did you mean" improvement).

- [ ] **Step 1: Write failing tests**

```ts
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
```

- [ ] **Step 2: Run to verify failure** — `yarn test run` → FAIL (module not found).
- [ ] **Step 3: Implement `input-helpers.ts`** (plain pure functions; Levenshtein = classic DP, ~15 lines).
- [ ] **Step 4: Run to verify pass** — `yarn test run` → all green.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: terminal input helpers with tests"`

---

### Task 5: Command registry (TDD)

**Files:**
- Create: `src/lib/commands.tsx`
- Test: `src/lib/__tests__/commands.test.tsx`

**Interfaces:**
- Produces:

```tsx
import type { ComponentType } from 'react'

export interface CommandDef {
  name: string
  description: string            // shown by help
  lsEntry?: { name: string; perms: string; note: string } // shown by ls (only section cmds + files)
  kind: 'output' | 'action'
  Output?: ComponentType         // for kind 'output' (wired in Tasks 8-10; placeholder until then)
  action?: 'clear' | 'matrix' | 'hack' | 'open-resume'
}
export const COMMANDS: CommandDef[]                 // canonical order = help order in src-astro/pages/index.astro:257-348
export const COMMAND_NAMES: string[]                // names for completion/suggestions
export function findCommand(name: string): CommandDef | undefined
export interface Execution {                        // what the reducer stores per submitted line
  kind: 'component' | 'text' | 'action'
  componentName?: string                            // key into COMMANDS for kind 'component'
  text?: { color: string; lines: string[] }         // for joke/text outputs
  action?: 'clear' | 'matrix' | 'hack' | 'open-resume'
  awaitProjectResponse?: boolean                    // set by 'projects'
}
export function executeLine(raw: string, ctx: { awaitingProjectResponse: boolean }): Execution
```

- `executeLine` reproduces `src-astro/pages/index.astro:739-880` exactly:
  - empty input → random pick from the 7 emoji messages (index.astro:707-715), kind `text`
  - `clear` → action clear; `resume` → action open-resume + the "Opening resume..." text; `sudo` → Santa Claus joke; `rm -rf /|*` → CRITICAL ERROR joke, other `rm` → "rm: missing operand"; `vi|vim|nano` → "code ." joke (copy all strings verbatim from index.astro:749-775)
  - when `ctx.awaitingProjectResponse`: `y/yes` → GitHub-link text block, `n/no` → "Alright! ..." text, else "Please answer with y/n." keeping the flag (index.astro:777-796)
  - `matrix`/`hack` → intro text + action
  - known section command → kind `component` (whoami, welcome, about, projects, skills, experience, education, certifications, contact, github, ls, neofetch, help, time, weather, ping); `projects` also sets `awaitProjectResponse: true`
  - unknown → "Command not found: X" text + (improvement) `suggestClosest` hint appended as second line: `Did you mean 'help'?` when non-null

- [ ] **Step 1: Write failing tests**

```tsx
import { describe, it, expect } from 'vitest'
import { COMMANDS, COMMAND_NAMES, executeLine } from '../commands'

const noCtx = { awaitingProjectResponse: false }

describe('registry', () => {
  it('contains all 25 commands', () => {
    expect(COMMAND_NAMES.sort()).toEqual([
      'about','certifications','clear','contact','education','experience','github','hack',
      'help','ls','matrix','nano','neofetch','ping','projects','resume','rm','skills',
      'sudo','time','vi','vim','weather','welcome','whoami',
    ].sort())
  })
  it('every command has a description', () =>
    COMMANDS.forEach(c => expect(c.description.length).toBeGreaterThan(0)))
})

describe('executeLine', () => {
  it('clear → action', () => expect(executeLine('clear', noCtx).action).toBe('clear'))
  it('sudo → Santa joke', () =>
    expect(executeLine('sudo', noCtx).text!.lines[0]).toContain('Santa Claus'))
  it('rm -rf / → protected', () =>
    expect(executeLine('rm -rf /', noCtx).text!.lines[0]).toContain("can't let you delete"))
  it('projects sets follow-up flag', () =>
    expect(executeLine('projects', noCtx).awaitProjectResponse).toBe(true))
  it('y answers follow-up', () => {
    const r = executeLine('y', { awaitingProjectResponse: true })
    expect(r.text!.lines.join(' ')).toContain('GitHub')
  })
  it('bad follow-up keeps flag', () =>
    expect(executeLine('maybe', { awaitingProjectResponse: true }).awaitProjectResponse).toBe(true))
  it('unknown command suggests', () => {
    const r = executeLine('hepl', noCtx)
    expect(r.text!.lines[0]).toContain('Command not found')
    expect(r.text!.lines[1]).toContain("help")
  })
  it('section command renders component', () =>
    expect(executeLine('about', noCtx)).toMatchObject({ kind: 'component', componentName: 'about' }))
})
```

- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `commands.tsx`.** Copy descriptions from the help list (`src-astro/pages/index.astro:257-348`) and ls entries (`index.astro:99-162`). `Output` fields reference a temporary `Placeholder` component (`() => <div>…</div>`) until Tasks 8-10 replace them.
- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat: command registry with executeLine and tests"`

---

### Task 6: Terminal reducer + hook (TDD)

**Files:**
- Create: `src/lib/terminal-reducer.ts`, `src/lib/useTerminal.ts`
- Test: `src/lib/__tests__/terminal-reducer.test.ts`

**Interfaces:**
- Consumes: `executeLine`, `Execution` from Task 5.
- Produces:

```ts
export interface Block { id: number; command: string; execution: Execution }
export interface TerminalState {
  blocks: Block[]
  history: string[]              // submitted non-empty commands
  awaitingProjectResponse: boolean
  overlay: 'matrix' | 'hack' | null
  shutdown: boolean
  maximized: boolean
  nextId: number
}
export type TerminalAction =
  | { type: 'submit'; raw: string }
  | { type: 'clear' }            // also Ctrl+L
  | { type: 'overlay-closed' }
  | { type: 'shutdown' } | { type: 'reboot' }
  | { type: 'toggle-maximize' }
export const initialState: TerminalState  // blocks pre-seeded with welcome + whoami (matches static intro blocks index.astro:33-63)
export function terminalReducer(state: TerminalState, action: TerminalAction): TerminalState
```

`useTerminal.ts`: thin `useReducer(terminalReducer, initialState)` wrapper that also performs side effects for the latest execution (`open-resume` → `window.open('/resume.pdf', '_blank')`; matrix/hack delay 300ms then set overlay — implemented via `useEffect` watching the last block). Reboot resets to `initialState` (re-runs welcome + whoami like index.astro:438-466).

- [ ] **Step 1: Write failing tests** — pure reducer only:

```ts
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
```

(Reducer sets `overlay` synchronously; the 300ms theatrical delay lives in the UI layer, not the reducer.)

- [ ] **Step 2: Run → FAIL.**  
- [ ] **Step 3: Implement reducer + `useTerminal`.**  
- [ ] **Step 4: Run → PASS.**  
- [ ] **Step 5: Commit** — `git commit -am "feat: terminal state reducer and useTerminal hook with tests"`

---

### Task 7: Terminal shell UI

**Files:**
- Create: `src/components/terminal/Terminal.tsx`, `src/components/terminal/Prompt.tsx`, `src/components/terminal/InputLine.tsx`, `src/components/terminal/Suggestions.tsx`, `src/components/terminal/TitleBar.tsx`, `src/components/terminal/ShutdownScreen.tsx`, `src/components/terminal/CopyButton.tsx`, `src/lib/useIdleTimer.ts`
- Modify: `src/routes/index.tsx` (render `<Terminal />` inside the page wrapper div from index.astro:18)

**Interfaces:**
- Consumes: `useTerminal`, input helpers, `COMMAND_NAMES`.
- Produces: fully interactive shell. Blocks render via a `BlockOutput` switch: `component` → `COMMANDS` lookup `Output`; `text` → colored lines; `action` → its text if any.

Port sources: markup `src-astro/pages/index.astro:17-361`; behavior `index.astro:370-737`.

- [ ] **Step 1: `Prompt.tsx`** — the `❯ dfanso@terminal in ~/portfolio on main` line (index.astro:36-45), props `{ children?: ReactNode }` for the typed command text.
- [ ] **Step 2: `TitleBar.tsx`** — traffic-light buttons + centered title + live clock (`HH:MM`, `setInterval` 1s with cleanup — replaces `updateTime`, index.astro:1476+). Props: `{ onClose, onMinimize, onMaximize }`.
- [ ] **Step 3: `InputLine.tsx`** — hidden `<input>` overlay + rendered `.command-text` + block cursor, exactly like index.astro:66-79. Local state: `value`, `historyIndex`. Keydown handling (index.astro:560-589): Tab → `completeInput`; Ctrl/Cmd+L → `dispatch clear`; Enter → `onSubmit(value)`; ArrowUp/Down → `navigateHistory`. Renders `<Suggestions items={getSuggestions(value, COMMAND_NAMES)} onPick={...} />`.
- [ ] **Step 4: `Terminal.tsx`** — composes TitleBar + block list + InputLine + footer ("Made with ❤ by DFanso") + `<ShutdownScreen />`. Behavior:
  - click anywhere (not link/suggestion) focuses input (index.astro:542-549); auto-scroll to bottom on new block (`useEffect` on `blocks.length`, `el.scrollTop = el.scrollHeight`)
  - maximize toggles the container classes (index.astro:469-476); minimize plays the 200ms dip (index.astro:479-484); close → fade + `dispatch shutdown` (index.astro:430-436); ShutdownScreen "REBOOT SYSTEM" → `dispatch reboot`
  - output region wrapper gets `aria-live="polite"` (improvement #5)
- [ ] **Step 5: `useIdleTimer.ts`** — 7s timeout toggling `terminal-idle` class on body; listeners mousemove/touchstart/keydown; full cleanup (port of index.astro:397-405,595-599).
- [ ] **Step 6: `CopyButton.tsx`** — selection-based floating copy button + "Copied! 📋" feedback (index.astro:616-679) as a component listening to `mouseup` on the terminal ref, cleanup on unmount.
- [ ] **Step 7: Verify manually** — `yarn dev`: typing works, suggestions show/hide, Tab completes, ↑↓ history, Enter appends prompt-echo block (outputs still placeholder), Ctrl+L clears, close→shutdown→reboot restores welcome+whoami echo, maximize/minimize animate, clock ticks.
- [ ] **Step 8: Commit** — `git commit -am "feat: interactive terminal shell UI"`

---

### Task 8: Port simple output components

**Files:**
- Create in `src/components/outputs/`: `Welcome.tsx`, `Whoami.tsx` (from Header.astro), `About.tsx`, `Contact.tsx`, `Education.tsx`, `Certifications.tsx`, `TimeOutput.tsx`, `Weather.tsx`, `Ping.tsx`
- Modify: `src/lib/commands.tsx` (replace placeholders with real components)

**Interfaces:**
- Consumes: `src/data/portfolio.ts`; conversion rules from Global Constraints.
- Produces: each component takes no props and renders one command's output.

- [ ] **Step 1: Port each component 1:1** from `src-astro/components/{Welcome,Header,About,Contact,Education,Certifications}.astro`. `TimeOutput` renders `new Date().toLocaleTimeString()` in `text-[#9ece6a]` (replaces the `current-time` div, index.astro:204-208). `Weather` and `Ping` are static ports of index.astro:209-256.
- [ ] **Step 2: Wire into registry**, delete their placeholders.
- [ ] **Step 3: Verify** — `yarn dev`; run each command; compare side-by-side with production site (https://itsme.dfanso.dev). Also `yarn test run` still green (registry test unchanged).
- [ ] **Step 4: Commit** — `git commit -am "feat: port simple terminal output components"`

---

### Task 9: Port complex outputs (Skills, Experience, Projects, Ls, Neofetch, Help)

**Files:**
- Create: `src/components/outputs/Skills.tsx`, `Experience.tsx`, `Projects.tsx`, `Ls.tsx`, `Neofetch.tsx`, `Help.tsx`
- Modify: `src/lib/commands.tsx`

**Interfaces:**
- Consumes: registry metadata (Help and Ls derive from `COMMANDS` — improvement: single source of truth).
- Produces: remaining static outputs; `Projects` renders its own trailing "Would you like to see more projects? (y/n)" prompt line (index.astro:866-876 — fold it into the component).

- [ ] **Step 1: Port `Skills.astro` (167 lines) and `Experience.astro` (343 lines)** — mostly markup + portfolio data loops; icons per conversion rule.
- [ ] **Step 2: Port `Projects.astro` (184 lines)** + append the y/n prompt line inside the component.
- [ ] **Step 3: Build `Ls.tsx` and `Help.tsx` from the registry** — map over `COMMANDS` (`lsEntry` for Ls incl. welcome.txt/whoami.txt/resume.pdf file rows; description list for Help incl. the usage header and footer hints, index.astro:257-348). Rendered output must match the current site's text content exactly.
- [ ] **Step 4: Port `Neofetch` ASCII block** (index.astro:164-202).
- [ ] **Step 5: Verify** — run every command in dev; text content matches production; `yarn test run` green.
- [ ] **Step 6: Commit** — `git commit -am "feat: port skills, experience, projects, ls, neofetch, help outputs"`

---

### Task 10: GitHub stats server function + component (TDD for fallback)

**Files:**
- Create: `src/lib/github.server.ts` (pure fetch logic in `src/lib/github-fetch.ts` so it's testable), `src/components/outputs/GitHubStats.tsx`
- Test: `src/lib/__tests__/github-fetch.test.ts`
- Modify: `src/lib/commands.tsx`

**Interfaces:**
- Produces:

```ts
// github-fetch.ts (pure, injectable fetch)
export interface GitHubStatsData { /* shape mirroring what GitHubStats.astro template consumes:
  user { name, bio, followers, publicRepos, avatarUrl }, totalStars, totalContributions,
  contributionCalendar weeks, topRepos[{name,stars,url,language}] — derive exact fields
  from src-astro/components/GitHubStats.astro:1-165 template usage */ }
export async function fetchGitHubStats(token: string | undefined, fetchImpl?: typeof fetch): Promise<GitHubStatsData | null>
// github.server.ts
export const getGitHubStats = createServerFn({ method: 'GET' }).handler(() =>
  fetchGitHubStats(process.env.GITHUB_TOKEN))
```

- Behavior port of `src-astro/components/GitHubStats.astro:8-166`: GraphQL first (same query), REST fallback (`/users/DFanso` + repos by stars) when GraphQL fails, `null` when both fail.
- `GitHubStats.tsx`: on mount calls `getGitHubStats()`; states: loading spinner line → data render (port the template, GitHubStats.astro markup) → fallback "Unable to fetch GitHub data. API may be rate limited." (line 412).

- [ ] **Step 1: Write failing tests** — inject a stub `fetchImpl`:

```ts
it('uses GraphQL when it succeeds', ...)        // stub returns valid GraphQL payload → data populated from it
it('falls back to REST when GraphQL fails', ...) // GraphQL 401 → REST payloads used
it('returns null when both fail', ...)
```

Assert on 2-3 representative fields (e.g. `totalStars`, `user.name`).

- [ ] **Step 2: Run → FAIL.**  
- [ ] **Step 3: Implement `github-fetch.ts`** (port the two functions + data massaging verbatim, parameterized fetch), then `github.server.ts` and the component.
- [ ] **Step 4: Run → PASS.** Manual: `github` command in dev shows live stats (set `GITHUB_TOKEN` in `.env` — note it in README) and the fallback line when offline.
- [ ] **Step 5: Commit** — `git commit -am "feat: live GitHub stats via server function with REST fallback"`

---

### Task 11: Output animations + syntax highlighting

**Files:**
- Create: `src/lib/syntax-highlight.ts`, `src/lib/useOutputReveal.ts`
- Modify: `src/components/terminal/Terminal.tsx` (block rendering)
- Test: `src/lib/__tests__/syntax-highlight.test.ts`

**Interfaces:**
- Produces:
  - `highlightSegments(text: string): Array<{ text: string; className?: string }>` — pure port of the 7 regex patterns (index.astro:388-396) applied to a plain string; React renders segments as `<span className>` (no innerHTML — improvement over DOM mutation).
  - `useOutputReveal(ref)` — on block mount: text < 100 chars & single element → char-by-char typing (15ms + jitter, index.astro:990-1011, restore full content at end); otherwise staggered `.typing-line` reveal (40ms/element, index.astro:974-988). Ls block additionally gets the anime.js stagger sequence (index.astro:803-842). All timers/anime instances cleaned up on unmount; skipped entirely under `prefers-reduced-motion`.
- Blocks must be memoized (`React.memo` on the block renderer keyed by block id) so reveals run once and never re-trigger.

- [ ] **Step 1: Write failing tests for `highlightSegments`**

```ts
it('highlights error words', () =>
  expect(highlightSegments('build failed today')).toContainEqual({ text: 'failed', className: 'syntax-error' }))
it('highlights urls', () =>
  expect(highlightSegments('see https://x.dev now').some(s => s.className === 'syntax-link')).toBe(true))
it('passes plain text through', () =>
  expect(highlightSegments('hello world')).toEqual([{ text: 'hello world' }]))
```

- [ ] **Step 2: Run → FAIL.** **Step 3: Implement** (single pass: find earliest match among patterns, emit segments). **Step 4: Run → PASS.**
- [ ] **Step 5: Apply highlighting** to `text`-kind block lines and the prompt-echo, and wire `useOutputReveal` into the block renderer.
- [ ] **Step 6: Verify in dev** — outputs type/stagger in; `ls` animates like production; no re-animation when typing further commands.
- [ ] **Step 7: Commit** — `git commit -am "feat: output reveal animations and syntax highlighting"`

---

### Task 12: Easter-egg overlays, boot sequence, ambient effects

**Files:**
- Create: `src/components/effects/MatrixOverlay.tsx`, `src/components/effects/HackOverlay.tsx` (both lazy), `src/components/effects/AmbientEffects.tsx`, `src/lib/useBootSequence.ts`
- Modify: `src/components/terminal/Terminal.tsx`, `src/routes/index.tsx`

**Interfaces:**
- Produces: `<MatrixOverlay onExit />`, `<HackOverlay onExit />` — full-screen canvas/DOM overlays, exit on Escape or click, `onExit` dispatches `overlay-closed`. Loaded via `React.lazy(() => import(...))` + `<Suspense fallback={null}>` (improvement #7: code-split).
- Port sources: matrix rain + quotes + glitch `src-astro/pages/index.astro:1015-1166`; hack sequence `index.astro:1168-1306`; boot `index.astro:1309-1327`; ambient (glow pulse 1338, particles 1355, title glitch 1400, enter burst 1438) — all `requestAnimationFrame`/timer loops with cleanup.
- Improvements #3/#4: particle count halved below `sm` breakpoint (`window.innerWidth < 640`); every ambient effect no-ops under `prefers-reduced-motion`.

- [ ] **Step 1: `MatrixOverlay`** — canvas rain (`drawRain`), cycling quotes, glitch effect; rAF loop stored in ref, cancelled on unmount; Escape/click → `onExit`.
- [ ] **Step 2: `HackOverlay`** — line-by-line fake hack log + progress bars (mkLine/mkBar port); timers tracked and cleared.
- [ ] **Step 3: Wire overlays** — Terminal renders them when `state.overlay` is set (after the 300ms intro text delay handled in `useTerminal`).
- [ ] **Step 4: `useBootSequence` + `AmbientEffects`** — boot class transitions on load; glow pulse, floating particles, title glitch, Enter-key burst as one component mounted on the index route.
- [ ] **Step 5: Verify** — `matrix` and `hack` run and exit cleanly (no console errors, no stuck overlays after ESC), particles float, Enter sparks, reduced-motion OS setting disables ambience. Network tab: matrix/hack chunks load on demand.
- [ ] **Step 6: Commit** — `git commit -am "feat: matrix/hack overlays, boot sequence and ambient effects"`

---

### Task 13: Resume route

**Files:**
- Create: `src/routes/resume.tsx`
- Port source: `src-astro/pages/resume.astro` (362 lines)

**Interfaces:**
- Consumes: `src/data/portfolio.ts`.
- Produces: `/resume` route with its own `head()` (port resume.astro's Layout props: title/description) rendering the same resume layout.

- [ ] **Step 1: Port markup** per conversion rules; any inline `<script>` behavior in resume.astro becomes hooks with cleanup.
- [ ] **Step 2: Verify** — `/resume` renders identical to production; `yarn build` prerenders `resume/index.html`.
- [ ] **Step 3: Commit** — `git commit -am "feat: port resume page"`

---

### Task 14: SEO finishing — sitemap, vercel.json

**Files:**
- Create: `public/sitemap.xml`
- Modify: `vercel.json`
- Delete: `scripts/copy-sitemaps.mjs`

- [ ] **Step 1: Static sitemap**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://itsme.dfanso.dev/</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://itsme.dfanso.dev/resume</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
</urlset>
```

Check `public/robots.txt` exists and references the sitemap; create if missing (`Sitemap: https://itsme.dfanso.dev/sitemap.xml`).

- [ ] **Step 2: Rewrite `vercel.json`** — drop `"framework": "astro"`, the `builds` block, and the `/_astro/` header; keep security headers and immutable caching, retargeted:

```json
{
  "buildCommand": "yarn build",
  "installCommand": "yarn install",
  "cleanUrls": true,
  "github": { "silent": true },
  "headers": [
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/(.*)\\.(jpg|jpeg|png|webp|avif|ico|svg)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/(.*)", "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "X-XSS-Protection", "value": "1; mode=block" }
    ] }
  ]
}
```

(Nitro's Vercel preset is auto-detected on Vercel; no `outputDirectory` needed. If the deploy preview 404s, set the Vercel project Framework Preset to "Other" and re-check.)

- [ ] **Step 3: Verify** — `yarn build` clean; `curl localhost:.../sitemap.xml` after `yarn start` returns the XML.
- [ ] **Step 4: Commit** — `git commit -am "feat: static sitemap and vercel config for TanStack Start"`

---

### Task 15: Verification matrix, then Astro teardown

**Files:**
- Delete: `src-astro/`, `astro.config.mjs`, `tailwind.config.mjs`, `.astro/` (if present), `promt.text` (leftover junk — confirm with `git log` it's not referenced)
- Modify: `package.json` (remove astro deps), `README.md` (update stack/commands/env `GITHUB_TOKEN`)

- [ ] **Step 1: Full manual verification matrix** against production (https://itsme.dfanso.dev), in dev AND in `yarn build && yarn start`:

| Check | Expected |
|---|---|
| Every command: help, ls, welcome, whoami, about, projects (+y/+n/+junk), skills, experience, education, certifications, contact, github, neofetch, time, weather, ping, resume, clear, sudo, rm, rm -rf /, vi, vim, nano, matrix (+ESC), hack (+ESC), unknown cmd | Output matches production (github = live data; unknown adds "did you mean") |
| Empty Enter | Random emoji message |
| Tab completion, suggestions dropdown + click, ↑/↓ history, Ctrl+L | Work as production |
| Close → shutdown screen → REBOOT | Terminal resets with welcome + whoami |
| Maximize / minimize buttons, header clock | Work |
| Boot/CRT power-on, scanlines, particles, glow, title glitch, Enter burst | Present; disabled under reduced motion |
| Mobile viewport (390px) | Input focusable, layout intact, fewer particles |
| `/resume` | Matches production |
| `/resume.pdf` | Downloads |
| Unknown URL | 404 page, HTTP status 404 |
| `view-source` of prerendered `/` | Full HTML content present (SEO), meta/OG/JSON-LD tags present |
| `yarn test run` | All green |
| `yarn generate:cv` | Still produces PDF |

Fix anything that fails before proceeding.

- [ ] **Step 2: Remove Astro**

```bash
yarn remove astro @astrojs/sitemap @astrojs/tailwind @astrojs/vercel astro-icon animejs tailwindcss@3 || true
```

Careful: `animejs` and `tailwindcss` must REMAIN (v3 animejs, v4 tailwind are in deps from Task 2) — only remove the astro packages: `yarn remove astro @astrojs/sitemap @astrojs/tailwind @astrojs/vercel astro-icon`. Then `git rm -r src-astro astro.config.mjs tailwind.config.mjs scripts/copy-sitemaps.mjs`.

- [ ] **Step 3: Re-run build + tests** — `yarn build && yarn test run` → clean. `yarn dev` smoke test.
- [ ] **Step 4: Update README** (stack description, commands, `GITHUB_TOKEN` env var for github command).
- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: remove Astro after TanStack Start migration verified"
```

- [ ] **Step 6: Push branch for Vercel preview** — `git push -u origin migrate/tanstack-start`; verify the Vercel preview deployment renders `/`, `/resume`, 404, and the `github` command (needs `GITHUB_TOKEN` set in Vercel project env).

---

## Self-review notes

- Spec coverage: stack (T2), structure/routes (T2/T3/T13), registry+reducer (T5/T6), shell (T7), outputs (T8/T9), GitHub server fn (T10), animations/highlight (T11), overlays/ambient/boot (T12), SEO/sitemap (T3/T14), error handling (T5 unknown cmds, T10 fallback, T3 404), improvements 1-8 (T5/T7/T11/T12/T10), teardown+verification (T15). ✓
- Interfaces consistent: `Execution`/`executeLine` (T5) consumed by reducer (T6) and block renderer (T7); `COMMANDS` consumed by Ls/Help (T9); `fetchGitHubStats` signature stable (T10). ✓
- Porting tasks reference exact `src-astro` file:line sources instead of inlining thousands of lines of markup; all NEW logic has complete code + tests. ✓
