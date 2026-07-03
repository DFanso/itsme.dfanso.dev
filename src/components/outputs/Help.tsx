import { COMMANDS } from '../../lib/commands'

/**
 * Ported 1:1 from the `#help` block in src-astro/pages/index.astro:257-348
 * (registered under the `help` command). The old markup was
 * `<div id="help"><div class="command-list">...</div></div>`; unlike the
 * generic `command-output` wrapper this task drops elsewhere (see
 * About.tsx), `command-list` is a distinct, meaningfully-styled class (see
 * `.command-list`/`#help .command-list ul li::before` in app.css, the
 * latter of which paints the "└─▶" bullet in front of every row via CSS —
 * it's not in this markup), so it's kept as this component's root, the same
 * way Ping.tsx keeps `ping-animation`.
 *
 * The command list is derived from the `COMMANDS` registry (single source
 * of truth, shared with `Ls`) instead of being hand-duplicated: it maps
 * over every entry with `!hidden`, in registry order, which is exactly the
 * 19 commands (ls → github) the Astro source listed — the 6 easter-egg
 * commands (resume, sudo, rm, vi, vim, nano) are marked `hidden: true` in
 * the registry and excluded here, matching the source never mentioning them
 * in this list (while `executeLine` still handles them as input).
 *
 * Each command name is a `<button data-command-trigger={c.name}>` (not a
 * `<div>`), so — like `Ls`'s directory rows — it's tappable/activatable
 * without typing the command out; `Terminal.tsx`'s delegated click handler
 * on `#terminal` runs it. (accessibility pass, commit 3d056be)
 */
export function Help() {
  const visible = COMMANDS.filter((c) => !c.hidden)

  return (
    <div className="command-list">
      <p className="text-[#bb9af7] font-bold mb-4">Terminal Portfolio Help</p>
      <div className="mb-4">
        <p className="text-[#7aa2f7] mb-2">USAGE:</p>
        <p className="text-[#c0caf5] ml-4">command [arguments]</p>
        <p className="text-[#a9b1d6] ml-4 text-xs mt-1">Tip: tap any command below to run it.</p>
      </div>
      <div className="mb-4">
        <p className="text-[#7aa2f7] mb-2">AVAILABLE COMMANDS:</p>
        <ul className="command-help-list">
          {visible.map((c) => (
            <li key={c.name}>
              <button type="button" data-command-trigger={c.name} className="command-name">
                {c.name}
              </button>
              <div className="command-desc">{c.description}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="text-[#a9b1d6] text-xs mt-6">
        <p>Use arrow keys ↑↓ to navigate command history</p>
        <p>Press Ctrl+L or type 'clear' to clear screen</p>
      </div>
    </div>
  )
}
