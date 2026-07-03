/**
 * Pure port of the old site's syntax highlighting (src-astro/pages/index.astro:
 * `highlightPatterns` at 388-396, applied via `applySyntaxHighlight` /
 * `highlightTextNode` at 932-961).
 *
 * The old code walked rendered text nodes and sequentially ran
 * `String.replace` with each pattern over an (already HTML-escaped) HTML
 * string, wrapping every match in a `<span class="...">`. That's fine for
 * non-overlapping matches, but successive `replace` calls can re-match
 * inside HTML already emitted by an earlier pattern (e.g. a `--flag`
 * pattern matching inside a previously-inserted `<span class="syntax-...">`
 * attribute), and it requires `innerHTML` mutation.
 *
 * This port instead operates on a single plain string and produces a flat,
 * non-overlapping list of segments for React to render as `<span
 * className>` — no HTML string building, no `innerHTML`. Same 7 patterns,
 * same precedence order. Precedence is resolved by scanning, at each
 * position, for the *earliest* match across all patterns; ties (two
 * patterns matching at the same start index) are won by whichever pattern
 * is listed first, matching the old code's sequential-replace order.
 */

export interface HighlightSegment {
  text: string
  className?: string
}

interface HighlightPattern {
  regex: RegExp
  className: string
}

// Order matters: this is the exact precedence order from
// index.astro:388-396.
const PATTERNS: HighlightPattern[] = [
  { regex: /(error|failed|failure|oops)/gi, className: 'syntax-error' },
  { regex: /(success|ready|completed|done|online)/gi, className: 'syntax-success' },
  { regex: /(warning|caution)/gi, className: 'syntax-warning' },
  { regex: /(https?:\/\/[^\s<]+)/gi, className: 'syntax-link' },
  { regex: /(--?[a-z0-9-]+)/gi, className: 'syntax-flag' },
  { regex: /(~\/[a-z0-9_\-/]+)/gi, className: 'syntax-path' },
  { regex: /\b(ls|cat|touch|mkdir|ping|curl|grep|git)\b/gi, className: 'syntax-command' },
]

/**
 * Splits `text` into an ordered, non-overlapping list of segments, each
 * either plain (`{ text }`) or highlighted (`{ text, className }`).
 * Concatenating every segment's `text` reproduces the input exactly.
 */
export function highlightSegments(text: string): HighlightSegment[] {
  const segments: HighlightSegment[] = []
  const length = text.length
  let pos = 0

  while (pos < length) {
    let matchStart = -1
    let matchEnd = -1
    let matchClassName: string | undefined

    for (const { regex, className } of PATTERNS) {
      regex.lastIndex = pos
      const match = regex.exec(text)
      if (match && (matchStart === -1 || match.index < matchStart)) {
        matchStart = match.index
        matchEnd = match.index + match[0].length
        matchClassName = className
      }
    }

    if (matchStart === -1) {
      segments.push({ text: text.slice(pos) })
      break
    }

    if (matchStart > pos) {
      segments.push({ text: text.slice(pos, matchStart) })
    }

    segments.push({ text: text.slice(matchStart, matchEnd), className: matchClassName })
    pos = matchEnd
  }

  return segments
}
