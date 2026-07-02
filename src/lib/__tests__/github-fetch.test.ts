import { describe, it, expect, vi } from 'vitest'
import { fetchGitHubStats, fetchProjectStats } from '../github-fetch'

/** Minimal stand-in for the subset of `Response` the fetch logic touches. */
function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response
}

describe('fetchGitHubStats', () => {
  it('uses GraphQL when it succeeds', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('graphql')) {
        return jsonResponse({
          data: {
            user: {
              name: 'D Fanso',
              login: 'DFanso',
              avatarUrl: 'https://example.com/avatar.png',
              bio: 'Software engineer',
              followers: { totalCount: 42 },
              following: { totalCount: 10 },
              repositories: {
                totalCount: 2,
                nodes: [
                  {
                    name: 'repo-a',
                    stargazerCount: 10,
                    forkCount: 2,
                    primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
                  },
                  {
                    name: 'repo-b',
                    stargazerCount: 5,
                    forkCount: 1,
                    primaryLanguage: { name: 'Go', color: '#00ADD8' },
                  },
                ],
              },
              pinnedItems: {
                nodes: [
                  {
                    name: 'pinned-repo',
                    description: 'A pinned repo',
                    url: 'https://github.com/DFanso/pinned-repo',
                    stargazerCount: 20,
                    forkCount: 4,
                    primaryLanguage: { name: 'Rust', color: '#dea584' },
                  },
                ],
              },
              contributionsCollection: {
                totalCommitContributions: 120,
                totalPullRequestContributions: 15,
                totalIssueContributions: 3,
                totalRepositoryContributions: 2,
                contributionCalendar: {
                  totalContributions: 500,
                  weeks: [
                    { contributionDays: [{ contributionCount: 3, date: '2026-01-01', weekday: 4 }] },
                  ],
                },
              },
            },
          },
        })
      }
      throw new Error(`unexpected fetch to ${url}`)
    })

    const data = await fetchGitHubStats('fake-token', fetchImpl as unknown as typeof fetch)

    expect(data).not.toBeNull()
    expect(data!.hasFullData).toBe(true)
    expect(data!.stats.stars).toBe(15) // 10 + 5, summed over all repositories.nodes
    expect(data!.stats.followers).toBe(42)
    expect(data!.topRepos[0]).toMatchObject({ name: 'pinned-repo', stars: 20 })
  })

  it('falls back to REST when GraphQL fails', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('graphql')) {
        return jsonResponse({ message: 'Bad credentials' }, false)
      }
      if (url.includes('/users/DFanso/repos')) {
        return jsonResponse([
          {
            name: 'proj1',
            html_url: 'https://github.com/DFanso/proj1',
            description: 'desc1',
            language: 'Python',
            stargazers_count: 12,
            forks_count: 3,
            fork: false,
          },
          {
            name: 'proj2',
            html_url: 'https://github.com/DFanso/proj2',
            description: null,
            language: null,
            stargazers_count: 4,
            forks_count: 1,
            fork: false,
          },
        ])
      }
      if (url.includes('/users/DFanso')) {
        return jsonResponse({ public_repos: 8, followers: 55 })
      }
      throw new Error(`unexpected fetch to ${url}`)
    })

    const data = await fetchGitHubStats('fake-token', fetchImpl as unknown as typeof fetch)

    expect(data).not.toBeNull()
    expect(data!.hasFullData).toBe(false)
    expect(data!.stats.followers).toBe(55)
    expect(data!.stats.stars).toBe(16) // 12 + 4
    expect(data!.topRepos[0]).toMatchObject({ name: 'proj1', stars: 12 })
  })

  it('returns null when both fail', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('graphql')) {
        return jsonResponse({ message: 'Bad credentials' }, false)
      }
      return jsonResponse({ message: 'Not Found' }, false)
    })

    const data = await fetchGitHubStats('fake-token', fetchImpl as unknown as typeof fetch)

    expect(data).toBeNull()
  })

  it('skips GraphQL and goes straight to REST when no token is set', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('graphql')) {
        throw new Error('should not call GraphQL without a token')
      }
      if (url.includes('/users/DFanso/repos')) {
        return jsonResponse([])
      }
      return jsonResponse({ public_repos: 1, followers: 2 })
    })

    const data = await fetchGitHubStats(undefined, fetchImpl as unknown as typeof fetch)

    expect(data).not.toBeNull()
    expect(data!.hasFullData).toBe(false)
  })
})

describe('fetchProjectStats', () => {
  it('maps stats for successful repos and null for failed ones', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('DFanso/repo1')) {
        return jsonResponse({ stargazers_count: 5, forks_count: 2, subscribers_count: 1 })
      }
      if (url.includes('DFanso/repo2')) {
        return jsonResponse({ message: 'Not Found' }, false)
      }
      throw new Error(`unexpected fetch to ${url}`)
    })

    const stats = await fetchProjectStats(
      ['DFanso/repo1', 'DFanso/repo2'],
      undefined,
      fetchImpl as unknown as typeof fetch,
    )

    expect(stats['DFanso/repo1']).toEqual({ stars: 5, forks: 2, watchers: 1 })
    expect(stats['DFanso/repo2']).toBeNull()
  })
})
