# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Yarn is the package manager (`packageManager` field pins it). Use `yarn`, not `npm`, when adding/installing deps so `yarn.lock` stays authoritative.

- `yarn dev` — Astro dev server at `localhost:4321`.
- `yarn build` — `astro build` followed by `node scripts/copy-sitemaps.mjs` (the second step is required; see "Sitemap copy step" below).
- `yarn preview` — preview the production build.
- `yarn generate:cv` — regenerate `public/resume.pdf` from `src/data/portfolio.ts` via `@react-pdf/renderer` (no browser/Chromium needed). Run this whenever portfolio data changes if you want the downloadable PDF to match the site.
- `yarn astro …` — direct access to the Astro CLI.

There is no test suite, linter, or formatter wired up. `tsconfig.json` extends `astro/tsconfigs/strict`, so type errors surface via `astro check` / editor / `astro build`.

## Architecture

### Single source of truth: `src/data/portfolio.ts`

All résumé content — `profile`, `companies[].roles[]`, `education`, `certifications`, `skillGroups` — lives in this file. It is imported by **both**:

1. The Astro components under `src/components/` that render the site (`Experience`, `Education`, `Skills`, `Certifications`, `Contact`, etc.).
2. `scripts/generate-pdf.tsx`, which produces `public/resume.pdf`.

When editing résumé content, edit `portfolio.ts` only — do not duplicate strings into components or the PDF script. After substantive changes, run `yarn generate:cv` so the downloadable PDF stays in sync.

### The terminal page: `src/pages/index.astro`

This is one large file (~1500 lines) holding the entire interactive terminal. Structure:

- The Astro frontmatter sets `export const prerender = true` so this page is static even though the Vercel adapter is configured for `output: 'server'`.
- The template pre-renders every section (`Welcome`, `Header`, `About`, `Projects`, `Skills`, `Experience`, `Education`, `Certifications`, `Contact`, `GitHubStats`, plus an `ls` block) into a hidden `<div id="components">`. The visible terminal starts empty apart from the welcome + whoami output.
- A client-side `Terminal` TypeScript class (inside the `<script>` block) owns command execution, command history (↑/↓), Tab completion, idle detection, window controls (close/minimize/maximize), and clipboard. When the user types e.g. `about`, it clones `#about`'s innerHTML into a new output block — there is no client-side fetch or routing for sections.
- Special commands (`clear`, `resume`, `sudo`, `rm`, `vi/vim/nano`, `matrix`, `hack`, `ping`, `neofetch`, `time`, `weather`) are handled inline in `executeCommand`. To add a new command: add it to `availableCommands` (used for Tab completion) and add a branch in `executeCommand`. If it should map 1:1 to a component, also add a corresponding `<div id="…">` to the hidden components block.

### Other routes

- `src/pages/resume.astro` — a print-styled HTML résumé that pulls from `portfolio.ts`. Separate code path from the React-PDF generator; both consume the same data.
- `src/pages/[...any].astro` — catch-all 404 (sets `Astro.response.status = 404`). Astro's catch-all route, not a wildcard handler.
- `src/layouts/Layout.astro` — shared `<head>` (SEO/OG/Twitter meta, manifest, fonts, Vercel Analytics + Speed Insights).

### GitHub stats (`src/components/GitHubStats.astro`)

Fetched **at build time** (component runs server-side during prerender), not in the browser. Two paths:

1. If `GITHUB_TOKEN` is present in env, it calls the GitHub **GraphQL** API for contribution calendar, commits/PRs/issues counts, pinned items, and language stats.
2. If not, it falls back to the public **REST** API for a reduced set (user info + top repos by stars).

A `hasData` / `hasFullData` flag drives which UI is rendered. Treat `GITHUB_TOKEN` as optional but recommended; do not introduce a hard dependency on it.

### Sitemap copy step

`@astrojs/sitemap` writes `sitemap-*.xml` into `dist/client/` during build, but the Vercel adapter serves static files from `.vercel/output/static/`. `scripts/copy-sitemaps.mjs` bridges that gap and runs automatically as part of `yarn build`. If you change the build pipeline, make sure this step still runs after `astro build`.

### Styling

- Tailwind v3 via `@astrojs/tailwind` (no `@apply` heavy custom CSS — most styling is inline `class="..."`).
- Color palette is Tokyo Night, used via Tailwind arbitrary values (`text-[#7aa2f7]`, `bg-[#1a1b26]`, etc.). Stay consistent with these hex values rather than introducing new accent colors.
- Some animation uses `animejs` v3 (already a dep) for staggered line reveals.

## Deployment

Deploys to Vercel via `@astrojs/vercel` (`output: 'server'` + Vercel adapter). `vercel.json` sets long-cache headers for static assets and security headers (X-Frame-Options DENY, nosniff, XSS-Protection). The `site` URL is `https://itsme.dfanso.dev` — used by Astro for canonical URLs and the sitemap.
