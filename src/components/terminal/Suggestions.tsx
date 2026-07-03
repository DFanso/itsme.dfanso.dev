import type { CSSProperties } from 'react'

// Ported from the `showSuggestions` DOM building in
// src-astro/pages/index.astro:493-538 (markup + matched/remaining text
// split) and the `.suggestions-container`/`.suggestion-item` styling in
// src/styles/app.css. Positioning is passed in as an inline style computed
// by the caller (InputLine), mirroring the old code's
// `getBoundingClientRect()`-based placement relative to the terminal.

interface SuggestionsProps {
  items: string[]
  input: string
  onPick: (command: string) => void
  style?: CSSProperties
}

export function Suggestions({ items, input, onPick, style }: SuggestionsProps) {
  return (
    <div className={`suggestions-container${items.length === 0 ? ' hidden' : ''}`} style={style}>
      {items.map((item) => (
        <div
          key={item}
          className="suggestion-item"
          data-command={item}
          onClick={() => onPick(item)}
        >
          <span className="matched-text">{item.slice(0, input.length)}</span>
          <span className="remaining-text">{item.slice(input.length)}</span>
        </div>
      ))}
    </div>
  )
}
