import { useEffect, useState } from 'react'

/**
 * Registered under the `time` command, replacing the old `#current-time`
 * div (index.astro:204-208) that the vanilla-JS build populated on the
 * client. `new Date().toLocaleTimeString()` is inherently
 * hydration-unsafe (server and client clocks/locales can disagree, and the
 * value is nondeterministic run to run) so it must not be computed during
 * render. It renders a static `--:--:--` placeholder and only reads the
 * real clock in a post-mount effect, matching how the rest of the app
 * treats `time` command output as user-triggered (not part of the seeded
 * SSR welcome/whoami blocks).
 */
export function TimeOutput() {
  const [time, setTime] = useState('--:--:--')

  useEffect(() => {
    setTime(new Date().toLocaleTimeString())
  }, [])

  return <div className="text-[#9ece6a]">{time}</div>
}
