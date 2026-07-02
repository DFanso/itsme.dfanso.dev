import type { ReactNode } from 'react'

// Ported from src-astro/pages/index.astro:36-45 (and the identical prompt
// markup repeated at :51-59, :67-75, :446-454). `children` carries the typed
// or echoed command text (plus, for the live input line, the cursor + hidden
// input) that used to sit right after the `:~` span.

interface PromptProps {
  children?: ReactNode
}

export function Prompt({ children }: PromptProps) {
  return (
    <div className="command-prompt">
      <span className="text-[#9ece6a]">❯</span>{' '}
      <span className="text-[#7aa2f7]">dfanso</span>
      <span className="hidden sm:inline">
        <span className="text-[#565f89]">@</span>
        <span className="text-[#bb9af7]">terminal</span>{' '}
        <span className="text-[#565f89]">in</span> <span className="text-[#e0af68]">~/portfolio</span>{' '}
        <span className="text-[#565f89]">on</span> <span className="text-[#f7768e]">main</span>
      </span>
      <span className="sm:hidden text-[#565f89]">:~</span>
      {children}
    </div>
  )
}
