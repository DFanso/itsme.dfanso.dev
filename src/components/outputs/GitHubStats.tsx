import { useEffect, useState } from 'react'
import { GITHUB_USERNAME, type GitHubStatsData } from '../../lib/github-fetch'
import { getGitHubStats } from '../../lib/github-server-fn'
import LucideBookIcon from '~icons/lucide/book'
import LucideBookMarkedIcon from '~icons/lucide/book-marked'
import LucideCircleDotIcon from '~icons/lucide/circle-dot'
import LucideGitCommitIcon from '~icons/lucide/git-commit'
import LucideGitForkIcon from '~icons/lucide/git-fork'
import LucideGitPullRequestIcon from '~icons/lucide/git-pull-request'
import LucideStarIcon from '~icons/lucide/star'
import LucideUsersIcon from '~icons/lucide/users'
import GithubIcon from '~icons/simple-icons/github'

/** Ported verbatim from GitHubStats.astro's `getContributionLevel` (lines 156-162). */
function getContributionLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 6) return 2
  if (count <= 9) return 3
  return 4
}

type Status = { kind: 'loading' } | { kind: 'data'; data: GitHubStatsData } | { kind: 'error' }

/**
 * Ported from `src-astro/components/GitHubStats.astro`'s template
 * (lines 214-416). `class` prop and inner `command-output` div dropped for
 * the same reason noted in About.tsx.
 *
 * The Astro source fetched at build time, so it had no loading state; here
 * the fetch is client-triggered (`getGitHubStats`, a `createServerFn`) on
 * mount, so a `loading` state is added ahead of the `data`/`error` states
 * astro's `hasData` ternary already had (`error` === astro's `!hasData`
 * fallback branch, astro line 410-413).
 *
 * `getGitHubStats` is imported normally from `github-server-fn.ts` — that's
 * the whole point of `createServerFn`: TanStack Start's build step swaps its
 * handler body for a client-side RPC call, so importing and calling it here
 * like any other async function is the intended pattern. This is safe for
 * `commands.test.tsx` (which imports `commands.tsx`, which registers this
 * component) too: that test never renders `GitHubStats`, so the effect below
 * never runs and the server function is never invoked under Vitest.
 */
export function GitHubStats() {
  const [status, setStatus] = useState<Status>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false
    getGitHubStats()
      .then((data) => {
        if (cancelled) return
        setStatus(data ? { kind: 'data', data } : { kind: 'error' })
      })
      .catch(() => {
        if (!cancelled) setStatus({ kind: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section>
      <div className="text-[#bb9af7] font-bold mb-4">GitHub Statistics</div>
      {status.kind === 'loading' && <div className="text-[#a9b1d6]">Fetching GitHub stats...</div>}
      {status.kind === 'error' && (
        <div className="text-[#f7768e]">
          <span className="text-[#a9b1d6]">└─▶</span> Unable to fetch GitHub data. API may be rate
          limited.
        </div>
      )}
      {status.kind === 'data' && <GitHubStatsBody data={status.data} />}
    </section>
  )
}

function GitHubStatsBody({ data }: { data: GitHubStatsData }) {
  const { hasFullData, stats, languageStats, topRepos, isPinned, contributionCalendar } = data
  const weeks = contributionCalendar?.weeks ?? []

  return (
    <div className="space-y-6">
      {/* Aggregate Stats */}
      <div className="stats-grid">
        <div className="text-[#7aa2f7] mb-2 flex items-center gap-2">
          <GithubIcon className="w-4 h-4" />
          <span>@{GITHUB_USERNAME}</span>
          {hasFullData && <span className="text-[#9ece6a] text-xs">(Last Year)</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 ml-4">
          {hasFullData && (
            <>
              <div className="stat-item">
                <div className="flex items-center gap-1 text-[#a9b1d6]">
                  <span>│</span>
                  <LucideGitCommitIcon className="w-3.5 h-3.5 text-[#9ece6a]" />
                </div>
                <div className="text-[#c0caf5] text-lg font-bold">{stats.commits.toLocaleString()}</div>
                <div className="text-[#a9b1d6] text-xs">Commits</div>
              </div>
              <div className="stat-item">
                <div className="flex items-center gap-1 text-[#a9b1d6]">
                  <span>│</span>
                  <LucideGitPullRequestIcon className="w-3.5 h-3.5 text-[#bb9af7]" />
                </div>
                <div className="text-[#c0caf5] text-lg font-bold">{stats.prs.toLocaleString()}</div>
                <div className="text-[#a9b1d6] text-xs">Pull Requests</div>
              </div>
              <div className="stat-item">
                <div className="flex items-center gap-1 text-[#a9b1d6]">
                  <span>│</span>
                  <LucideCircleDotIcon className="w-3.5 h-3.5 text-[#f7768e]" />
                </div>
                <div className="text-[#c0caf5] text-lg font-bold">{stats.issues.toLocaleString()}</div>
                <div className="text-[#a9b1d6] text-xs">Issues</div>
              </div>
            </>
          )}
          <div className="stat-item">
            <div className="flex items-center gap-1 text-[#a9b1d6]">
              <span>│</span>
              <LucideStarIcon className="w-3.5 h-3.5 text-[#e0af68]" />
            </div>
            <div className="text-[#c0caf5] text-lg font-bold">{stats.stars.toLocaleString()}</div>
            <div className="text-[#a9b1d6] text-xs">Total Stars</div>
          </div>
          {!hasFullData && (
            <>
              <div className="stat-item">
                <div className="flex items-center gap-1 text-[#a9b1d6]">
                  <span>│</span>
                  <LucideGitForkIcon className="w-3.5 h-3.5 text-[#7dcfff]" />
                </div>
                <div className="text-[#c0caf5] text-lg font-bold">{stats.forks.toLocaleString()}</div>
                <div className="text-[#a9b1d6] text-xs">Total Forks</div>
              </div>
              <div className="stat-item">
                <div className="flex items-center gap-1 text-[#a9b1d6]">
                  <span>│</span>
                  <LucideBookIcon className="w-3.5 h-3.5 text-[#7aa2f7]" />
                </div>
                <div className="text-[#c0caf5] text-lg font-bold">{stats.repos}</div>
                <div className="text-[#a9b1d6] text-xs">Repositories</div>
              </div>
              <div className="stat-item">
                <div className="flex items-center gap-1 text-[#a9b1d6]">
                  <span>│</span>
                  <LucideUsersIcon className="w-3.5 h-3.5 text-[#bb9af7]" />
                </div>
                <div className="text-[#c0caf5] text-lg font-bold">{stats.followers}</div>
                <div className="text-[#a9b1d6] text-xs">Followers</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contribution Graph (only with token) */}
      {hasFullData && weeks.length > 0 && (
        <div className="contribution-graph">
          <div className="text-[#7aa2f7] mb-2 flex items-center gap-2">
            <span className="text-[#a9b1d6]">├─▶</span>
            <span className="text-[#e0af68]">cat</span>
            <span>contributions.heatmap</span>
          </div>
          <div className="ml-6 overflow-x-auto">
            <div className="contribution-calendar flex gap-[3px] pb-2">
              {weeks.map((week, weekIndex) => (
                <div className="week flex flex-col gap-[3px]" key={weekIndex}>
                  {week.contributionDays.map((day) => (
                    <div
                      className="contribution-day w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] rounded-sm transition-all hover:ring-1 hover:ring-[#7aa2f7]"
                      data-level={getContributionLevel(day.contributionCount)}
                      title={`${day.date}: ${day.contributionCount} contributions`}
                      key={day.date}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-[#a9b1d6]">
              <span>Less</span>
              <div className="flex gap-[3px]">
                <div className="w-[10px] h-[10px] rounded-sm bg-[#1a1b26] border border-[#7aa2f7]/20" />
                <div className="w-[10px] h-[10px] rounded-sm bg-[#0e4429]" />
                <div className="w-[10px] h-[10px] rounded-sm bg-[#006d32]" />
                <div className="w-[10px] h-[10px] rounded-sm bg-[#26a641]" />
                <div className="w-[10px] h-[10px] rounded-sm bg-[#39d353]" />
              </div>
              <span>More</span>
              <span className="ml-4 text-[#9ece6a]">{stats.contributions} contributions this year</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Languages */}
      <div className="languages">
        <div className="text-[#7aa2f7] mb-2 flex items-center gap-2">
          <span className="text-[#a9b1d6]">├─▶</span>
          <span className="text-[#e0af68]">cat</span>
          <span>languages.stats</span>
        </div>
        <div className="ml-6">
          <div className="language-bar flex h-3 rounded-full overflow-hidden mb-2 bg-[#1a1b26]">
            {languageStats.map((lang) => (
              <div
                className="language-segment transition-all hover:opacity-80"
                style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                title={`${lang.name}: ${lang.percentage}%`}
                key={lang.name}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {languageStats.map((lang) => (
              <div className="flex items-center gap-1" key={lang.name}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                <span className="text-[#c0caf5]">{lang.name}</span>
                <span className="text-[#a9b1d6]">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top/Pinned Repositories */}
      {topRepos.length > 0 && (
        <div className="top-repos">
          <div className="text-[#7aa2f7] mb-2 flex items-center gap-2">
            <span className="text-[#a9b1d6]">└─▶</span>
            <span className="text-[#e0af68]">ls</span>
            <span>{isPinned ? 'pinned-repos/' : 'top-repos/'}</span>
          </div>
          <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topRepos.map((repo) => (
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="repo-card block p-3 border border-[#7aa2f7]/20 rounded-lg hover:border-[#7aa2f7]/50 hover:bg-[#7aa2f7]/5 transition-all"
                key={repo.name}
              >
                <div className="flex items-center gap-2 mb-1">
                  <LucideBookMarkedIcon className="w-4 h-4 text-[#7aa2f7]" />
                  <span className="text-[#7aa2f7] font-medium truncate">{repo.name}</span>
                </div>
                {repo.description && (
                  <p className="text-[#a9b1d6] text-xs mb-2 line-clamp-2">{repo.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: repo.languageColor ?? undefined }}
                      />
                      <span className="text-[#c0caf5]">{repo.language}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[#e0af68]">
                    <LucideStarIcon className="w-3 h-3" />
                    {repo.stars}
                  </span>
                  <span className="flex items-center gap-1 text-[#7dcfff]">
                    <LucideGitForkIcon className="w-3 h-3" />
                    {repo.forks}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
