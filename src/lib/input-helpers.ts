/**
 * Pure helper functions for the terminal input component: prefix
 * suggestions, tab-completion, command history navigation, and
 * "did you mean" typo suggestions.
 */

/** Names starting with the lowercased input, excluding an exact match. */
export function getSuggestions(input: string, names: string[]): string[] {
  if (!input) return []
  const lower = input.toLowerCase()
  return names.filter((name) => name.startsWith(lower) && name !== lower)
}

/** Unique completion for the given prefix, or null if zero/multiple matches. */
export function completeInput(input: string, names: string[]): string | null {
  const lower = input.toLowerCase()
  const matches = names.filter((name) => name.startsWith(lower))
  return matches.length === 1 ? matches[0] : null
}

/**
 * Mirrors the legacy handleArrowUp/handleArrowDown semantics: 'up' moves
 * back through history (stopping at 0), 'down' moves forward and clears
 * once past the end (index === history.length, value === '').
 */
export function navigateHistory(
  history: string[],
  index: number,
  dir: 'up' | 'down',
): { index: number; value: string } {
  if (dir === 'up') {
    const newIndex = index > 0 ? index - 1 : 0
    return { index: newIndex, value: history[newIndex] ?? '' }
  }

  const newIndex = index < history.length - 1 ? index + 1 : history.length
  return { index: newIndex, value: newIndex < history.length ? history[newIndex] : '' }
}

/** Classic DP Levenshtein edit distance between two strings. */
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array(b.length + 1).fill(i === 0 ? 0 : i),
  )
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

/** Nearest name by Levenshtein distance, only if distance <= 2. */
export function suggestClosest(input: string, names: string[]): string | null {
  const lower = input.toLowerCase()
  let best: string | null = null
  let bestDistance = Infinity
  for (const name of names) {
    const distance = levenshtein(lower, name)
    if (distance < bestDistance) {
      bestDistance = distance
      best = name
    }
  }
  return best !== null && bestDistance <= 2 ? best : null
}
