import { COMMANDS } from '../../lib/commands'

/**
 * Ported 1:1 from the `#ls` block in src-astro/pages/index.astro:99-162
 * (registered under the `ls` command). The old markup was
 * `<div id="ls"><div class="command-output">...</div></div>` — the inner
 * `command-output` div is dropped for the same reason noted in About.tsx
 * (Terminal.tsx already supplies exactly one `command-output` wrapper),
 * leaving the `ls-header`/`ls-entry`/`ls-footer` content as this
 * component's root-level children.
 *
 * Rows are derived from the `COMMANDS` registry (single source of truth,
 * shared with `Help`) instead of being hand-duplicated: every entry with an
 * `lsEntry` is a row, split into directories (`lsEntry.perms` starting with
 * `d`, name colored `#7aa2f7`) rendered first, then files (`-`, name colored
 * `#e0af68`) — matching both the Astro source's literal row ordering
 * (about/ ... github/, then welcome.txt, whoami.txt, resume.pdf) and its
 * per-row-type coloring, without needing a separate manually-maintained
 * order/color. Unlike `Help`, this list is NOT filtered by `hidden` —
 * `resume` is hidden from `help` but still appears here as `resume.pdf`,
 * matching the source.
 *
 * The derivation runs inside the component body (not at module scope) —
 * `commands.tsx` imports `Ls` to build `COMMANDS` itself, so a module-scope
 * `COMMANDS.filter(...)` here would run during that circular import, while
 * `COMMANDS` is still undefined.
 */
export function Ls() {
  const entries = COMMANDS.filter((c) => c.lsEntry)
  const directories = entries.filter((c) => c.lsEntry!.perms.startsWith('d'))
  const files = entries.filter((c) => c.lsEntry!.perms.startsWith('-'))

  return (
    <>
      <div className="text-[#bb9af7] font-bold mb-2 ls-header">Directory listing of ~/portfolio</div>
      <div className="space-y-1">
        {directories.map((c) => (
          <div className="ls-entry flex items-center gap-2" key={c.name}>
            <span className="text-[#565f89] hidden sm:inline">{c.lsEntry!.perms}</span>
            <span className="ls-name text-[#7aa2f7]">{c.lsEntry!.name}</span>
            <span className="text-[#565f89] ml-auto text-xs sm:text-sm">{c.lsEntry!.note}</span>
          </div>
        ))}
        {files.map((c) => (
          <div className="ls-entry flex items-center gap-2" key={c.name}>
            <span className="text-[#565f89] hidden sm:inline">{c.lsEntry!.perms}</span>
            <span className="ls-name text-[#e0af68]">{c.lsEntry!.name}</span>
            <span className="text-[#565f89] ml-auto text-xs sm:text-sm">{c.lsEntry!.note}</span>
          </div>
        ))}
      </div>
      <div className="text-[#565f89] text-xs mt-4 ls-footer">
        Use 'cd' to navigate or type the command directly (e.g., 'about', 'projects')
      </div>
    </>
  )
}
