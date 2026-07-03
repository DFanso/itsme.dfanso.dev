import type { ComponentType } from 'react'
import MailIcon from '~icons/lucide/mail'
import MapPinIcon from '~icons/lucide/map-pin'
import GithubIcon from '~icons/simple-icons/github'
import LinkedinIcon from '~icons/simple-icons/linkedin'
import DiscordIcon from '~icons/simple-icons/discord'
import InstagramIcon from '~icons/simple-icons/instagram'

/**
 * Ported 1:1 from src-astro/components/Contact.astro (registered under the
 * `contact` command). `astro-icon`'s `<Icon name="..." />` becomes a
 * statically-imported unplugin-icons component per row (icons need
 * build-time-resolvable import paths, so the `icon` string field from the
 * Astro source's data array is replaced with a direct component
 * reference). The wrapping `<section class:list={[className]}>` +
 * `<div class="command-output">` loses the `class` prop (no props here) and
 * the inner `command-output` div — Terminal.tsx already supplies exactly
 * one `command-output` wrapper around every rendered `Output` (see
 * About.tsx for the same note).
 *
 * `url` is optional (accessibility pass, commit 3d056be): the old source
 * gave the Location row a dead `href="#"` anchor — focusable and clickable
 * but going nowhere, a keyboard/screen-reader trap. Location now has no
 * `url` and renders as plain text instead of a link. `isExternal` (matching
 * the old site's identically-named helper) gates `target="_blank"
 * rel="noopener noreferrer"` on `http(s)` URLs only, so the `mailto:` link
 * opens in place rather than a blank new tab.
 */
interface ContactLink {
  id: string
  name: string
  url?: string
  Icon: ComponentType<{ className?: string }>
}

const contactInfo: ContactLink[] = [
  {
    id: 'EM',
    name: 'leogavin123@outlook.com',
    url: 'mailto:leogavin123@outlook.com',
    Icon: MailIcon,
  },
  { id: 'LO', name: 'Colombo, Sri Lanka', Icon: MapPinIcon },
  { id: 'GH', name: 'github.com/dfansoo', url: 'https://github.com/dfansoo', Icon: GithubIcon },
  {
    id: 'IN',
    name: 'linkedin.com/in/leogavin',
    url: 'https://www.linkedin.com/in/leogavin/',
    Icon: LinkedinIcon,
  },
  { id: 'DC', name: 'discord', url: 'https://discord.gg/DcFFdcjfAf', Icon: DiscordIcon },
  {
    id: 'IG',
    name: 'instagram.com/dfansoo',
    url: 'https://instagram.com/dfansoo',
    Icon: InstagramIcon,
  },
]

const isExternal = (url: string) => /^https?:/i.test(url)

export function Contact() {
  return (
    <section>
      <div className="text-[#bb9af7] font-bold mb-2">Contact Information</div>
      <div className="space-y-2">
        {contactInfo.map((link) => (
          <div className="flex items-center gap-2" key={link.id}>
            <span className="text-[#a9b1d6]">└─▶</span>
            <span className="text-[#e0af68] min-w-[30px]">[{link.id}]</span>
            <div className="flex items-center gap-2">
              <link.Icon className="w-4 h-4 text-[#7aa2f7]" />
              {link.url ? (
                <a
                  href={link.url}
                  {...(isExternal(link.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="text-[#7aa2f7] hover:text-[#9ece6a] transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <span className="text-[#c0caf5]">{link.name}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-[#a9b1d6] text-xs">
        <span className="text-[#9ece6a]">Note:</span> Click on any link to connect
      </div>
    </section>
  )
}
