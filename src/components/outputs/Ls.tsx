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
 *
 * Each row is a `<button>` carrying `data-command-trigger={c.name}` (not a
 * `<div>`) so the entries are reachable and activatable without a keyboard
 * being required to type the command out — a tap or Enter/Space on the row
 * runs it. `Terminal.tsx`'s single delegated click handler on `#terminal`
 * looks for `[data-command-trigger]` and calls `submit(cmd)`; that's the
 * same event-delegation shape the old site used
 * (`initializeCommandTriggers`, index.astro:892-903), just expressed as one
 * React `onClick` instead of a second imperative `addEventListener`.
 * (accessibility pass, commit 3d056be)
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
          <button
            type="button"
            data-command-trigger={c.name}
            className="ls-entry flex items-center gap-2 w-full text-left"
            key={c.name}
          >
            <span className="text-[#a9b1d6] hidden sm:inline">{c.lsEntry!.perms}</span>
            <span className="ls-name text-[#7aa2f7]">{c.lsEntry!.name}</span>
            <span className="text-[#a9b1d6] ml-auto text-xs sm:text-sm">{c.lsEntry!.note}</span>
          </button>
        ))}
        {files.map((c) => (
          <button
            type="button"
            data-command-trigger={c.name}
            className="ls-entry flex items-center gap-2 w-full text-left"
            key={c.name}
          >
            <span className="text-[#a9b1d6] hidden sm:inline">{c.lsEntry!.perms}</span>
            <span className="ls-name text-[#e0af68]">{c.lsEntry!.name}</span>
            <span className="text-[#a9b1d6] ml-auto text-xs sm:text-sm">{c.lsEntry!.note}</span>
          </button>
        ))}
      </div>
      <div className="text-[#a9b1d6] text-xs mt-4 ls-footer">
        Tap an entry or type the command (e.g., 'about', 'projects')
      </div>
    </>
  )
}
