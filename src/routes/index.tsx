import { createFileRoute } from '@tanstack/react-router'
import { Terminal } from '../components/terminal/Terminal'
import { AmbientEffects } from '../components/effects/AmbientEffects'

// Ported from src-astro/pages/index.astro:18 (page wrapper div) plus the
// `startAmbientAnimations()` call in `bootUp` (index.astro:1319) — mounted
// here as its own component (`AmbientEffects`) rather than inside `Terminal`
// so it can query `.min-h-screen` (this wrapper) for the floating-glyph
// layer, same as the old site's `spawnFloatingParticles`.
export const Route = createFileRoute('/')({
  component: () => (
    <div className="min-h-screen bg-[#16161e] overflow-hidden flex items-center justify-center p-2 sm:p-4">
      <Terminal />
      <AmbientEffects />
    </div>
  ),
})
