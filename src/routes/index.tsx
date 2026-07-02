import { createFileRoute } from '@tanstack/react-router'
import { Terminal } from '../components/terminal/Terminal'

// Ported from src-astro/pages/index.astro:18 (page wrapper div).
export const Route = createFileRoute('/')({
  component: () => (
    <div className="min-h-screen bg-[#16161e] overflow-hidden flex items-center justify-center p-2 sm:p-4">
      <Terminal />
    </div>
  ),
})
