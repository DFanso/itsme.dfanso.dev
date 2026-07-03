/**
 * Static port of the `weather` command's markup (index.astro:209-214). The
 * inner `command-output` div is dropped — Terminal.tsx already supplies it
 * (see About.tsx for the same note) — leaving just the two content divs.
 */
export function Weather() {
  return (
    <>
      <div className="text-[#7aa2f7]">Weather information is not available in the terminal.</div>
      <div className="text-[#a9b1d6]">Try looking outside your window! 🌤️</div>
    </>
  )
}
