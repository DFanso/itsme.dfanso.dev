/**
 * Ported 1:1 from src-astro/components/About.astro (registered under the
 * `about` command). The Astro source wrapped its content in
 * `<section class:list={[className]}><div class="command-output">...`; the
 * `class` prop is dropped (no props here) and so is the inner
 * `command-output` div — Terminal.tsx already wraps every rendered `Output`
 * in a single `command-output` div (see BlockOutput), so keeping this
 * component's own copy would double that wrapper (double left border /
 * indent). The outer `<section>` element itself is preserved.
 */
export function About() {
  return (
    <section>
      <div className="text-[#bb9af7] font-bold mb-2">Professional Summary</div>
      <div className="ml-4 border-l-2 border-[#a9b1d6] pl-4 text-sm space-y-4">
        <p className="leading-relaxed text-[#c0caf5]">
          <span className="text-[#7aa2f7] font-bold">Senior Software Engineer</span> at{' '}
          <span className="text-[#7aa2f7]">CD Extreme OPC</span>, holding a{' '}
          <span className="text-[#e0af68]">First-Class Honours</span> degree from the{' '}
          <span className="text-[#9ece6a]">University of Plymouth</span>. Experienced across
          DevOps pipelines, backend development, cloud infrastructure, and AI-driven automation.
        </p>

        <p className="leading-relaxed text-[#c0caf5]">
          <span className="text-[#bb9af7] font-bold">Co-Founder & CTO</span> of{' '}
          <span className="text-[#7aa2f7]">CodeXeed</span> and{' '}
          <span className="text-[#7aa2f7]">KlexD</span>, building scalable cloud-native
          applications and intelligent systems for global clients.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-[#a9b1d6] text-xs mb-1">FOCUS</div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#1a1b26] border border-[#7aa2f7]/30 text-[#7aa2f7] px-2 py-1 rounded text-xs">
                DevOps Pipelines
              </span>
              <span className="bg-[#1a1b26] border border-[#9ece6a]/30 text-[#9ece6a] px-2 py-1 rounded text-xs">
                Cloud Infrastructure
              </span>
              <span className="bg-[#1a1b26] border border-[#bb9af7]/30 text-[#bb9af7] px-2 py-1 rounded text-xs">
                Backend
              </span>
              <span className="bg-[#1a1b26] border border-[#e0af68]/30 text-[#e0af68] px-2 py-1 rounded text-xs">
                AI Automation
              </span>
            </div>
          </div>
          <div>
            <div className="text-[#a9b1d6] text-xs mb-1">LOCATION</div>
            <div className="text-[#c0caf5] flex items-center gap-2">
              <span className="text-[#f7768e]">📍</span> Sri Lanka (Open to Remote)
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
