import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// Ported from `initializeClipboard`/`showCopyButton`/`hideCopyButton`/
// `showCopyFeedback` (src-astro/pages/index.astro:616-679, behavior). The
// old site appended `#copy-button` and the `.copy-feedback` toast straight
// onto `document.body` (outside the terminal's own DOM subtree) so they sit
// above everything and are unaffected by the terminal's own transforms; a
// portal reproduces that here. Rendered as a sibling of `.terminal-container`
// in `Terminal.tsx` rather than nested inside it, so its (portalled) clicks
// don't bubble through the terminal's own click-to-focus handler.

interface CopyButtonProps {
  containerRef: React.RefObject<HTMLElement | null>
}

export function CopyButton({ containerRef }: CopyButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [selectionText, setSelectionText] = useState('')
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [feedbackVisible, setFeedbackVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleMouseUp() {
      const selection = window.getSelection()
      const text = selection?.toString() ?? ''
      if (!text) {
        setPosition(null)
        return
      }

      setSelectionText(text)
      if (selection && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect()
        setPosition({ top: rect.top - 30, left: rect.right })
      }
    }

    container.addEventListener('mouseup', handleMouseUp)
    return () => container.removeEventListener('mouseup', handleMouseUp)
  }, [containerRef])

  // "Copied! 📋" toast auto-dismisses after 1.5s (index.astro:670-679).
  useEffect(() => {
    if (!feedbackVisible) return
    const timer = window.setTimeout(() => setFeedbackVisible(false), 1500)
    return () => window.clearTimeout(timer)
  }, [feedbackVisible])

  const handleClick = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    navigator.clipboard.writeText(selectionText).then(() => setFeedbackVisible(true))
  }, [selectionText])

  if (!mounted) return null

  return createPortal(
    <>
      <button
        type="button"
        id="copy-button"
        className="copy-button"
        style={position ? { display: 'block', top: position.top, left: position.left } : { display: 'none' }}
        onClick={handleClick}
      >
        📋
      </button>
      {feedbackVisible && <div className="copy-feedback">Copied! 📋</div>}
    </>,
    document.body,
  )
}
