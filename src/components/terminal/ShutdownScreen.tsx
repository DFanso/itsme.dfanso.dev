// Ported from src-astro/pages/index.astro:353-360 (markup) and the
// `btnClose`/`btnReboot` handlers (index.astro:430-466, behavior). The old
// site toggled `hidden`/`flex` via classList; here that's driven by the
// `visible` prop (bound to `state.shutdown`).

interface ShutdownScreenProps {
  visible: boolean
  onReboot: () => void
}

export function ShutdownScreen({ visible, onReboot }: ShutdownScreenProps) {
  return (
    <div
      id="shutdown-screen"
      className={`fixed inset-0 z-50 bg-[#16161e] flex-col items-center justify-center text-center p-4 ${
        visible ? 'flex' : 'hidden'
      }`}
    >
      <div className="text-[#f7768e] font-bold text-xl mb-4">System Halted</div>
      <div className="text-[#a9b1d6] mb-8">It is now safe to turn off your computer.</div>
      <button
        type="button"
        id="btn-reboot"
        className="px-6 py-2 border border-[#7aa2f7] text-[#7aa2f7] hover:bg-[#7aa2f7]/10 rounded transition-colors font-mono"
        onClick={onReboot}
      >
        REBOOT SYSTEM
      </button>
    </div>
  )
}
