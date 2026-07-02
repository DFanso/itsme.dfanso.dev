# Astro → TanStack Start Migration — Design

**Date:** 2026-07-02
**Status:** Approved direction (TanStack Start, clean rebuild, improve along the way)

## Goal

Rebuild itsme.dfanso.dev — a terminal-themed portfolio currently written in Astro — as a TanStack Start (React) application. Same site, same content, same terminal concept; the tech underneath changes and known rough edges are fixed along the way. Deployment stays on Vercel.

## Why

The interactive terminal is currently ~1,600 lines of inline vanilla TypeScript inside a 2,022-line `index.astro`. Command output works by cloning hidden pre-rendered components via `innerHTML`. Animation loops and event listeners are never cleaned up. Adding a command means editing several disconnected places. React with a proper state model fixes all of this.

## Decisions made

| Decision | Choice |
| --- | --- |
| Framework | TanStack Start (user's explicit choice over Next.js / React Router 7) |
| Migration approach | Clean rebuild on a branch in this repo; Astro removed at the end |
| Fidelity | Keep the terminal look and commands; fix rough edges while porting |
| Hosting | Vercel (unchanged) |

## Stack

- **TanStack Start** (latest `@tanstack/react-start` + TanStack Router), React 19, TypeScript, Vite. Scaffolded with `npx @tanstack/cli@latest create`.
- **Nitro** Vite plugin; Vercel preset auto-detected at deploy.
- **Prerendering enabled** (`tanstackStart({ prerender: { enabled: true, crawlLinks: true } })`) so `/` and `/resume` ship as static HTML for SEO, like today.
- **Tailwind CSS v4** via `@tailwindcss/vite` (upgrade from v3; same Tokyo Night palette).
- **Icons:** `unplugin-icons` reusing the existing `@iconify-json/{lucide,mdi,simple-icons}` packages — build-time inline SVG, no runtime fetch (parity with astro-icon).
- **Analytics:** `@vercel/analytics/react` + `@vercel/speed-insights/react`.
- Package manager stays yarn.

## Structure

```
src/
  routes/
    __root.tsx        # HTML shell, meta/OG tags, fonts, analytics,
                      # terminal-styled notFoundComponent (replaces 404.astro)
    index.tsx         # terminal page
    resume.tsx        # port of resume.astro
    $.tsx             # catch-all, matches [...any].astro behavior
  components/
    terminal/         # Terminal shell, title bar, prompt line, input
    outputs/          # one component per command output: Welcome, Whoami,
                      # About, Projects, Skills, Experience, Education,
                      # Certifications, Contact, GitHubStats, Ls, Neofetch, Help
    effects/          # MatrixOverlay, HackOverlay, particles, glow pulse,
                      # title glitch, boot sequence
  lib/
    commands.tsx      # command registry (single source of truth)
    useTerminal.ts    # reducer hook: output blocks, command history, tab completion
    github.server.ts  # createServerFn: GitHub GraphQL with REST fallback, token server-side
  data/
    portfolio.ts      # copied unchanged — remains the shared data source
  styles/app.css
scripts/generate-pdf.tsx   # kept as-is (@react-pdf/renderer, already React)
public/                    # resume.pdf, profile assets, static sitemap.xml
```

## Terminal architecture

- **Command registry** (`commands.tsx`): map of command name → `{ description, kind }` where kind is either `render` (an output component) or `action` (clear, matrix, hack, sudo joke, rm/vi/vim/nano jokes, resume download). `help` and `ls` derive their listings from the registry — adding a command is one entry.
- **`useTerminal` reducer**: state is `{ blocks: {command, outputKey}[], history: string[], historyIndex, input }`. Executing a command appends a block; the block renders its React component directly. `clear` resets blocks. Arrow-key history and tab completion operate on registry keys.
- **Easter-egg overlays** (matrix rain, hack sequence): lazy-loaded via `React.lazy`, `requestAnimationFrame` loops and listeners cleaned up on unmount, exit on Escape/click.
- **GitHub stats**: `github` command calls a TanStack server function on demand. Improvement over today: stats are live per-visit instead of frozen at build time; the `GITHUB_TOKEN` stays server-side. Graceful fallback message on API failure (parity with current behavior).
- **Window buttons** (close/minimize/maximize/reboot) and ambient effects (particles, glow pulse, title glitch, header clock, idle timer, Enter burst) ported as hooks/components with cleanup.

## Improvements included in the port

1. Real React rendering — no hidden-div `innerHTML` cloning.
2. Proper cleanup of every timer, rAF loop, and listener.
3. Mobile: reliable input focus handling, fewer particles on small screens.
4. `prefers-reduced-motion` respected for ambient animations.
5. Accessibility: `aria-live="polite"` on terminal output, keyboard-only navigable.
6. Unknown commands get a "did you mean …" suggestion.
7. Heavy easter-egg overlays code-split out of the initial bundle.
8. Live GitHub stats via server function (see above).

## SEO / meta

- Per-route `head()` with the same titles, descriptions, and OG tags as the current Astro `Layout.astro`.
- Static `public/sitemap.xml` listing `/` and `/resume` (replaces `@astrojs/sitemap` + `scripts/copy-sitemaps.mjs` — two URLs don't need a build integration).

## Error handling

- Unknown terminal command → error line + suggestion; never throws.
- GitHub server fn: GraphQL → REST fallback → "Unable to fetch GitHub data" message (matches current behavior).
- Router `notFoundComponent` renders the terminal-styled 404; catch-all route preserves the current `[...any]` behavior.
- `failOnError: true` in prerender config so broken pages fail the build, not production.

## Testing & verification

- **Vitest** unit tests (TDD) for pure logic: command registry integrity (help/ls derive correctly), reducer transitions, tab completion, history navigation, unknown-command suggestions.
- Manual verification matrix before Astro is deleted: every command, easter eggs, window buttons, boot sequence, mobile viewport, `/resume`, 404, catch-all, resume.pdf download — compared side-by-side against the live site.
- Build verification: `yarn build` clean, prerendered HTML exists for `/` and `/resume`, `yarn preview` serves correctly.

## Teardown (end of migration)

- Remove all Astro dependencies, `astro.config.mjs`, `.astro` files, `scripts/copy-sitemaps.mjs`, tailwind v3 config.
- Update `vercel.json` / Vercel project settings for the Vite build.
- Keep `generate:cv` script working (`tsx scripts/generate-pdf.tsx`).

## Non-goals

- No content changes, no visual redesign, no new pages.
- No blog/CMS/auth — out of scope.
- Resume PDF pipeline unchanged.
