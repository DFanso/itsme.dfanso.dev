/**
 * Thin `createServerFn` wrappers around the pure logic in `github-fetch.ts`.
 * Kept separate from that module (rather than exporting these directly from
 * it) so `github-fetch.ts` stays free of `@tanstack/react-start` and can be
 * unit tested directly under Vitest (see vite.config.ts's `isVitest` guard
 * on the tanstackStart/nitro plugins). `GITHUB_TOKEN` is read from
 * `process.env` here, server-side only, and never sent to the client.
 *
 * Deliberately NOT named `github.server.ts`: TanStack Start's import
 * protection plugin (`@tanstack/start-plugin-core`) denies any import —
 * static or dynamic — of files matching `**\/*.server.*` from client-bundled
 * code (see its `defaults.js`), which would break `GitHubStats.tsx` and
 * `Projects.tsx` importing this module to call these functions. `.server.`
 * is reserved for modules that must never reach the client at all; a
 * `createServerFn` wrapper module — which is *meant* to be imported by
 * client code, with the framework's build step swapping the handler body
 * for an RPC stub on the client — is a different thing and needs a
 * different filename.
 */
import { createServerFn } from '@tanstack/react-start'
import { fetchGitHubStats, fetchProjectStats } from './github-fetch'

// `@types/node` isn't wired into tsconfig's `types` array (this is a
// browser-first app; see scripts/generate-pdf.tsx for the one other spot
// that reads `process` and has a known pre-existing `tsc` gap for it). This
// server-only handler legitimately runs under Node via Nitro, so declare
// just the slice of `process` it needs, scoped to this module.
declare const process: { env: { GITHUB_TOKEN?: string } }

export const getGitHubStats = createServerFn({ method: 'GET' }).handler(() =>
  fetchGitHubStats(process.env.GITHUB_TOKEN),
)

// `owner/repo` shorthand only: word chars, dots, and hyphens on each side of
// a single slash (matches the `github` field format used by Projects.tsx's
// project data, e.g. `dfanso/itsme.dfanso.dev`).
const REPO_PATTERN = /^[\w.-]+\/[\w.-]+$/

function validateRepos(repos: string[]): string[] {
  if (!Array.isArray(repos)) {
    throw new Error('getProjectStats: input must be an array of repo strings')
  }
  if (repos.length > 20) {
    throw new Error('getProjectStats: input must not exceed 20 repos')
  }
  for (const repo of repos) {
    if (typeof repo !== 'string' || !REPO_PATTERN.test(repo)) {
      throw new Error(`getProjectStats: invalid repo identifier "${String(repo)}"`)
    }
  }
  return repos
}

export const getProjectStats = createServerFn({ method: 'GET' })
  .validator(validateRepos)
  .handler(({ data }) => fetchProjectStats(data, process.env.GITHUB_TOKEN))
