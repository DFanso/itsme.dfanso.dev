/**
 * Ported 1:1 from src-astro/components/Welcome.astro (markup + copy).
 *
 * The Astro source has a client-side <script> that (a) swaps the static
 * "Hello, visitor!" greeting for a time-of-day greeting and (b) plays a
 * typewriter animation on first visit per session. That DOM-scripting
 * behavior is out of scope for this port (only the markup/CSS are ported
 * here) -- the greeting stays static, matching the source's SSR fallback
 * text. The `.typewriter` styles are still ported to app.css (see the
 * porting-source <style> block) so they're available if that behavior is
 * added later.
 */
const asciiArt = `
 ██████╗ ███████╗ █████╗ ███╗   ██╗███████╗ ██████╗ 
 ██╔══██╗██╔════╝██╔══██╗████╗  ██║██╔════╝██╔═══██╗
 ██║  ██║█████╗  ███████║██╔██╗ ██║███████╗██║   ██║
 ██║  ██║██╔══╝  ██╔══██║██║╚██╗██║╚════██║██║   ██║
 ██████╔╝██║     ██║  ██║██║ ╚████║███████║╚██████╔╝
 ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ 
`

const tagline = 'DevOps Engineer & Software Engineer'
const version = 'v2.5.0'

export function Welcome() {
  return (
    <div className="welcome-container">
      <div className="ascii-wrapper">
        <pre className="ascii-art">{asciiArt}</pre>
        <div className="ascii-glow"></div>
      </div>
      <div className="welcome-text mt-4">
        <p className="greeting" id="welcome-greeting">
          Hello, visitor!
        </p>
        <p className="tagline mt-2">{tagline}</p>
        <p className="mt-3 text-[#a9b1d6]">────────────────────────────────────</p>
        <p className="mt-3">
          Welcome to my terminal portfolio. <span className="version">(Version {version})</span>
        </p>
        <p className="mt-2 hint">
          Type <span className="command">'help'</span> to see available commands, or try{' '}
          <span className="command">'github'</span> for stats.
        </p>
      </div>
    </div>
  )
}
