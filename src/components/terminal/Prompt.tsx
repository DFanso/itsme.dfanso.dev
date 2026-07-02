import type { ReactNode } from 'react'

// Ported from src-astro/pages/index.astro:36-45 (and the identical prompt
// markup repeated at :51-59, :67-75, :446-454). `children` carries the typed
// or echoed command text (plus, for the live input line, the cursor + hidden
// input) that used to sit right after the `:~` span.
//
// `awaitingProjectResponse` ports the y/n prompt fix from
// src-astro/pages/index.astro's `Terminal.PROJECTS_PROMPT_HTML` /
// `setPromptPrefix` (commit 3d056be): while the terminal is waiting on a
// y/n answer to the `projects` command's follow-up, the *live* input line's
// prompt swaps from the normal `dfanso@terminal in ~/portfolio on main` to
// the question itself, so the typed answer renders inline right after
// "(y/n)" instead of next to an unrelated prompt. Only `InputLine` passes
// this prop — `CommandBlock`'s echoed/historical prompts always render the
// default, matching the old site only ever swapping `#input-line`'s prefix.
interface PromptProps {
  children?: ReactNode
  awaitingProjectResponse?: boolean
}

export function Prompt({ children, awaitingProjectResponse }: PromptProps) {
  return (
    <div className="command-prompt">
      {awaitingProjectResponse ? (
        <>
          <span className="text-[#9ece6a]">❯</span>{' '}
          <span className="text-[#c0caf5]">Would you like to see more projects?</span>{' '}
          <span className="text-[#a9b1d6]">(y/n)</span>{' '}
        </>
      ) : (
        <>
          <span className="text-[#9ece6a]">❯</span>{' '}
          <span className="text-[#7aa2f7]">dfanso</span>
          <span className="hidden sm:inline">
            <span className="text-[#a9b1d6]">@</span>
            <span className="text-[#bb9af7]">terminal</span>{' '}
            <span className="text-[#a9b1d6]">in</span> <span className="text-[#e0af68]">~/portfolio</span>{' '}
            <span className="text-[#a9b1d6]">on</span> <span className="text-[#f7768e]">main</span>
          </span>
          <span className="sm:hidden text-[#a9b1d6]">:~</span>
        </>
      )}
      {children}
    </div>
  )
}
