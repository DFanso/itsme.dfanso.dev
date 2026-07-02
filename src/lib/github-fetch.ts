/**
 * Pure (no `@tanstack/react-start` import), injectable-fetch port of the
 * data-fetching + massaging logic in `src-astro/components/GitHubStats.astro`
 * (frontmatter lines 8-208) and `src-astro/components/Projects.astro`
 * (frontmatter lines 5-25). Kept import-free of `@tanstack/*` so it can be
 * unit tested directly under Vitest (see vite.config.ts's `isVitest` guard
 * on the tanstackStart/nitro plugins) — `github.server.ts` wraps these in
 * `createServerFn` for actual use from the browser.
 */

const GITHUB_USERNAME = 'DFanso'

// ---------------------------------------------------------------------------
// GitHubStats.astro port
// ---------------------------------------------------------------------------

/**
 * Shape mirroring exactly what GitHubStats.astro's template (lines 214-416)
 * renders — not the raw GraphQL/REST payloads. `hasFullData` selects between
 * the GraphQL branch (commits/PRs/issues + contribution heatmap, available
 * only with a token) and the REST fallback branch (stars/forks/repos/
 * followers only, no token required). `topRepos` is normalized to one shape
 * regardless of source (astro's template branched per-field on `hasFullData`
 * instead: `repo.url` vs `repo.html_url`, `repo.stargazerCount` vs
 * `repo.stargazers_count`, etc).
 */
export interface GitHubStatsData {
  /** True when the GraphQL (token-authenticated) branch supplied the data. */
  hasFullData: boolean
  stats: {
    commits: number
    prs: number
    issues: number
    repos: number
    stars: number
    forks: number
    followers: number
    contributions: number
  }
  languageStats: Array<{ name: string; percentage: number; color: string }>
  topRepos: Array<{
    name: string
    url: string
    description: string | null
    language: string | null
    languageColor: string | null
    stars: number
    forks: number
  }>
  /** True when `topRepos` came from GitHub's pinned-repos list (vs top-starred). */
  isPinned: boolean
  /** Only populated when `hasFullData` — REST has no contribution calendar. */
  contributionCalendar: {
    totalContributions: number
    weeks: Array<{
      contributionDays: Array<{ contributionCount: number; date: string; weekday: number }>
    }>
  } | null
}

interface GraphQLLanguage {
  name: string
  color: string
}

interface GraphQLRepoNode {
  name: string
  stargazerCount: number
  forkCount: number
  primaryLanguage: GraphQLLanguage | null
}

interface GraphQLPinnedRepo {
  name: string
  description: string | null
  url: string
  stargazerCount: number
  forkCount: number
  primaryLanguage: GraphQLLanguage | null
}

interface GraphQLUser {
  followers: { totalCount: number }
  repositories: { totalCount: number; nodes: GraphQLRepoNode[] }
  pinnedItems: { nodes: GraphQLPinnedRepo[] }
  contributionsCollection: {
    totalCommitContributions: number
    totalPullRequestContributions: number
    totalIssueContributions: number
    contributionCalendar: {
      totalContributions: number
      weeks: Array<{
        contributionDays: Array<{ contributionCount: number; date: string; weekday: number }>
      }>
    }
  }
}

interface RestUser {
  public_repos: number
  followers: number
}

interface RestRepo {
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  fork: boolean
}

/** Ported verbatim from GitHubStats.astro's `fetchGitHubGraphQL` (lines 8-96). */
async function fetchGitHubGraphQL(
  token: string | undefined,
  fetchImpl: typeof fetch,
): Promise<GraphQLUser | null> {
  if (!token) {
    return null
  }

  const query = `
        query($username: String!) {
            user(login: $username) {
                name
                login
                avatarUrl
                bio
                followers { totalCount }
                following { totalCount }
                repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
                    totalCount
                    nodes {
                        name
                        stargazerCount
                        forkCount
                        primaryLanguage {
                            name
                            color
                        }
                    }
                }
                pinnedItems(first: 6, types: REPOSITORY) {
                    nodes {
                        ... on Repository {
                            name
                            description
                            url
                            stargazerCount
                            forkCount
                            primaryLanguage {
                                name
                                color
                            }
                        }
                    }
                }
                contributionsCollection {
                    totalCommitContributions
                    totalPullRequestContributions
                    totalIssueContributions
                    totalRepositoryContributions
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                                weekday
                            }
                        }
                    }
                }
            }
        }
    `

  try {
    const response = await fetchImpl('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Portfolio-Site',
      },
      body: JSON.stringify({
        query,
        variables: { username: GITHUB_USERNAME },
      }),
    })

    if (!response.ok) {
      console.error('GitHub GraphQL API error:', response.status)
      return null
    }

    const data = await response.json()
    return data.data?.user ?? null
  } catch (error) {
    console.error('Failed to fetch GitHub GraphQL data:', error)
    return null
  }
}

/** Ported verbatim from GitHubStats.astro's `fetchGitHubREST` (lines 99-120). */
async function fetchGitHubREST(
  fetchImpl: typeof fetch,
): Promise<{ user: RestUser; repos: RestRepo[] } | null> {
  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetchImpl(`https://api.github.com/users/${GITHUB_USERNAME}`, {
        headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'Portfolio-Site' },
      }),
      fetchImpl(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=stars&direction=desc&per_page=100`,
        { headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'Portfolio-Site' } },
      ),
    ])

    if (!userResponse.ok || !reposResponse.ok) return null

    const user = await userResponse.json()
    const repos = await reposResponse.json()

    return { user, repos }
  } catch (error) {
    console.error('Failed to fetch GitHub REST data:', error)
    return null
  }
}

/** Ported verbatim from GitHubStats.astro's `getLanguageColor` (lines 123-133). */
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    'C#': '#178600',
    'C++': '#f34b7d',
    C: '#555555',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    Svelte: '#ff3e00',
    Astro: '#ff5a03',
    HCL: '#844FBA',
    Dockerfile: '#384d54',
  }
  return colors[language] || '#8b8b8b'
}

/** Ported verbatim from GitHubStats.astro's `calculateLanguageStats` (lines 136-153). */
function calculateLanguageStats(
  repos: Array<{ primaryLanguage?: GraphQLLanguage | null; language?: string | null }>,
  isGraphQL: boolean,
): Array<{ name: string; percentage: number; color: string }> {
  const langCount: Record<string, { count: number; color: string }> = {}

  repos.forEach((repo) => {
    const lang = isGraphQL ? repo.primaryLanguage?.name : repo.language
    const color = isGraphQL ? repo.primaryLanguage?.color : lang ? getLanguageColor(lang) : undefined
    if (lang) {
      if (!langCount[lang]) langCount[lang] = { count: 0, color: color || '#8b8b8b' }
      langCount[lang].count++
    }
  })

  const total = Object.values(langCount).reduce((sum, l) => sum + l.count, 0)
  return Object.entries(langCount)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([name, data]) => ({
      name,
      percentage: Math.round((data.count / total) * 100),
      color: data.color,
    }))
}

/**
 * Ported from GitHubStats.astro's data-processing block (lines 164-211): try
 * GraphQL first, fall back to REST, and massage whichever source succeeded
 * into the normalized `GitHubStatsData` shape the component renders. Returns
 * `null` when both sources fail (astro's `hasData` false branch → fallback
 * message).
 */
export async function fetchGitHubStats(
  token: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<GitHubStatsData | null> {
  const graphqlData = await fetchGitHubGraphQL(token, fetchImpl)
  const restData = !graphqlData ? await fetchGitHubREST(fetchImpl) : null

  if (graphqlData) {
    const repos = graphqlData.repositories.nodes
    const languageStats = calculateLanguageStats(repos, true)
    const pinnedRepos = graphqlData.pinnedItems.nodes
    const contributionCalendar = graphqlData.contributionsCollection.contributionCalendar

    const stats = {
      commits: graphqlData.contributionsCollection.totalCommitContributions,
      prs: graphqlData.contributionsCollection.totalPullRequestContributions,
      issues: graphqlData.contributionsCollection.totalIssueContributions,
      repos: graphqlData.repositories.totalCount,
      stars: repos.reduce((sum, r) => sum + r.stargazerCount, 0),
      forks: repos.reduce((sum, r) => sum + r.forkCount, 0),
      followers: graphqlData.followers.totalCount,
      contributions: contributionCalendar.totalContributions,
    }

    const isPinned = pinnedRepos.length > 0
    // Astro source quirk preserved: when there are no pinned repos it falls
    // back to `repos.slice(0, 6)`, whose nodes were queried without `url` or
    // `description` (only pinnedItems requests those fields) — so those two
    // fields end up empty/null in that branch, same as the original.
    const topReposSource: Array<GraphQLRepoNode | GraphQLPinnedRepo> = isPinned
      ? pinnedRepos
      : repos.slice(0, 6)
    const topRepos = topReposSource.map((r) => ({
      name: r.name,
      url: 'url' in r ? r.url : '',
      description: 'description' in r ? r.description : null,
      language: r.primaryLanguage?.name ?? null,
      languageColor: r.primaryLanguage?.color ?? null,
      stars: r.stargazerCount,
      forks: r.forkCount,
    }))

    return {
      hasFullData: true,
      stats,
      languageStats,
      topRepos,
      isPinned,
      contributionCalendar: {
        totalContributions: contributionCalendar.totalContributions,
        weeks: contributionCalendar.weeks,
      },
    }
  }

  if (restData) {
    const { user, repos } = restData
    const languageStats = calculateLanguageStats(repos, false)
    const topReposSource = repos.filter((r) => !r.fork).slice(0, 6)
    const topRepos = topReposSource.map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      language: r.language,
      languageColor: r.language ? getLanguageColor(r.language) : null,
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
    }))

    const stats = {
      commits: 0,
      prs: 0,
      issues: 0,
      repos: user.public_repos,
      stars: repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0),
      forks: repos.reduce((sum, r) => sum + (r.forks_count || 0), 0),
      followers: user.followers,
      contributions: 0,
    }

    return {
      hasFullData: false,
      stats,
      languageStats,
      topRepos,
      isPinned: false,
      contributionCalendar: null,
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Projects.astro per-repo stats port
// ---------------------------------------------------------------------------

export interface ProjectRepoStats {
  stars: number
  forks: number
  watchers: number
}

/** Ported from Projects.astro's `getGitHubStats` (lines 5-25), fetch injected. */
async function fetchSingleRepoStats(
  repo: string,
  token: string | undefined,
  fetchImpl: typeof fetch,
): Promise<ProjectRepoStats | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-Site',
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const response = await fetchImpl(`https://api.github.com/repos/${repo}`, { headers })
    if (!response.ok) return null
    const data = await response.json()
    return {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      watchers: data.subscribers_count || 0,
    }
  } catch (error) {
    console.error(`Failed to fetch stats for ${repo}:`, error)
    return null
  }
}

/**
 * Fetches star/fork/watcher counts for each `owner/repo` identifier in
 * `repos` (as derived by Projects.astro's `projectsData[].github` field —
 * see Projects.astro:27-127), in parallel. A repo that fails to fetch (404,
 * rate limit, network error) maps to `null` rather than failing the whole
 * batch, matching Projects.astro's graceful per-project `stats: null` →
 * "don't render the stats row" behavior (Projects.astro:150-165).
 */
export async function fetchProjectStats(
  repos: string[],
  token: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<Record<string, ProjectRepoStats | null>> {
  const entries = await Promise.all(
    repos.map(async (repo) => [repo, await fetchSingleRepoStats(repo, token, fetchImpl)] as const),
  )
  return Object.fromEntries(entries)
}
