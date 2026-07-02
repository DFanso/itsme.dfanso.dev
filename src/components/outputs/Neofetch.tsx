/**
 * Ported 1:1 from the `#neofetch` block in src-astro/pages/index.astro:164-203
 * (registered under the `neofetch` command). The old markup was
 * `<div id="neofetch"><div class="command-output"><div class="flex ...">
 * ...</div></div></div>`; the inner `command-output` div is dropped for the
 * same reason noted in About.tsx (Terminal.tsx already supplies exactly one
 * `command-output` wrapper), leaving the `flex flex-col sm:flex-row gap-6`
 * row as this component's root.
 *
 * The ASCII art is lifted into a template literal (`asciiArt`, same
 * approach as Welcome.tsx's) rather than left as raw JSX text so its
 * leading spaces — which taper per line to shape the art — are preserved
 * exactly. The source's closing `</pre>` was preceded by a few tab
 * characters that are pure file-indentation noise (they don't align with
 * any real nesting level and render as invisible trailing whitespace) —
 * those are not reproduced, matching how Welcome.tsx's already-ported
 * `asciiArt` only carries the art's own leading spaces, not surrounding
 * file indentation.
 */
const asciiArt = `
                  ▄▄▄▄▄▄▄▄▄▄▄
                ▄▀█▀█▀█▀█▀█▀█▀▄
               █▀█▀█▀█▀█▀█▀█▀█▀█
              ▄█▀█▀█▀█▀█▀█▀█▀█▀█▄
             ▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀
`

export function Neofetch() {
  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <pre className="text-[#7aa2f7] text-[8px] sm:text-base leading-none sm:leading-normal">{asciiArt}</pre>
      <div className="space-y-1">
        <div className="flex gap-2">
          <span className="text-[#7aa2f7]">OS:</span>
          <span className="text-[#c0caf5]">Portfolio v2.4.2</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[#7aa2f7]">Host:</span>
          <span className="text-[#c0caf5]">dfanso.dev</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[#7aa2f7]">Kernel:</span>
          <span className="text-[#c0caf5]">DevOps 5.0.1</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[#7aa2f7]">Uptime:</span>
          <span className="text-[#c0caf5]">24/7</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[#7aa2f7]">Shell:</span>
          <span className="text-[#c0caf5]">Portfolio-CLI</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[#7aa2f7]">IDE:</span>
          <span className="text-[#c0caf5]">VS Code / Neovim</span>
        </div>
      </div>
    </div>
  )
}
