import { useEffect, useState } from 'react'

// Ported from src-astro/pages/index.astro:20-29 (markup) and the
// `updateTime` function (index.astro:1476-1492, behavior). The old site
// polled `setInterval(updateTime, 1000)` and wrote into `#header-time`
// directly; here the clock lives in local state, refreshed the same way but
// cleaned up on unmount.

interface TitleBarProps {
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
}

export function TitleBar({ onClose, onMinimize, onMaximize }: TitleBarProps) {
  const [time, setTime] = useState('--:--')

  useEffect(() => {
    function updateTime() {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }

    updateTime()
    const intervalId = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="terminal-title-bar shrink-0 flex justify-between items-center">
      <div className="terminal-buttons flex gap-2">
        <button
          type="button"
          id="btn-close"
          className="terminal-button bg-[#f7768e] hover:bg-[#db4b4b] transition-colors"
          aria-label="Close"
          onClick={onClose}
        />
        <button
          type="button"
          id="btn-minimize"
          className="terminal-button bg-[#e0af68] hover:bg-[#c09040] transition-colors"
          aria-label="Minimize"
          onClick={onMinimize}
        />
        <button
          type="button"
          id="btn-maximize"
          className="terminal-button bg-[#9ece6a] hover:bg-[#78ac3e] transition-colors"
          aria-label="Maximize"
          onClick={onMaximize}
        />
      </div>
      <div className="terminal-title absolute left-1/2 -translate-x-1/2 text-[#c0caf5] text-xs font-medium opacity-80">
        guest@dfanso.dev:~
      </div>
      <div className="terminal-time text-[#565f89] text-xs font-mono" id="header-time">
        {time}
      </div>
    </div>
  )
}
