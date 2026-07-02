import { useEffect, useState } from 'react'

// Ported from src-astro/pages/index.astro:20-29 (markup) and the
// `updateTime` function (index.astro:1476-1492, behavior). The old site
// polled `setInterval(updateTime, 1000)` and wrote into `#header-time`
// directly; here the clock lives in local state, refreshed the same way but
// cleaned up on unmount.
//
// `maximized` drives `aria-pressed` on the maximize button, matching the
// old site's `btnMaximize?.setAttribute('aria-pressed', ...)`
// (accessibility pass, commit 3d056be) — the button toggles a real UI
// state, so it should announce that state to assistive tech like any other
// toggle button. Hit-target and focus-visible-ring CSS for all three
// buttons live in app.css's `.terminal-button` rules.

interface TitleBarProps {
  maximized: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
}

export function TitleBar({ maximized, onClose, onMinimize, onMaximize }: TitleBarProps) {
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
          aria-pressed={maximized}
          onClick={onMaximize}
        />
      </div>
      <div className="terminal-title absolute left-1/2 -translate-x-1/2 text-[#c0caf5] text-xs font-medium opacity-80">
        guest@dfanso.dev:~
      </div>
      <div className="terminal-time text-[#a9b1d6] text-xs font-mono" id="header-time">
        {time}
      </div>
    </div>
  )
}
