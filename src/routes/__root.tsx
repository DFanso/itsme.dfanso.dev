import type { ReactNode } from 'react'
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import appCss from '../styles/app.css?url'
import profileImage from '../assets/profile.webp'
import { CrtOverlay } from '../components/effects/CrtOverlay'
import { NotFound } from '../components/NotFound'

// Ported from src-astro/layouts/Layout.astro:27-148. Layout.astro computed
// canonical/OG URLs from `Astro.url` per-page.
//
// The canonical `<link>` below is derived from the current match's
// `pathname` (root's own head() runs on every route, and TanStack Router's
// `<link>` de-duplication only drops *exact* duplicate tags, not
// same-`rel` ones — see headContentUtils.js's `appendUniqueUserTags`, which
// is keyed on `JSON.stringify(tag)` for links but on `name`/`property` for
// `meta`). A child route re-declaring `rel: 'canonical'` with a different
// href (e.g. Task 13's `/resume`) would therefore render two conflicting
// canonical tags instead of overriding this one, so canonical/og:url/
// twitter:url are computed per-path here instead of hardcoded to the site
// root — child routes only need to override the `meta`-based tags (title,
// description, og/twitter title+description), which dedupe cleanly by
// `name`/`property` (first match wins, and matches are walked leaf-first).
const SITE_URL = 'https://itsme.dfanso.dev/'
const TITLE = 'Leo Felcianas - DevOps Engineer & Software Developer'
const DESCRIPTION =
  'DevOps/Backend specialist crafting efficient and scalable solutions. Expert in cloud architecture, containerization, and modern development practices.'
const OG_IMAGE_URL = 'https://itsme.dfanso.dev/og-image.svg'
const PROFILE_IMAGE_URL = new URL(profileImage, SITE_URL).toString()

export const Route = createRootRoute({
  head: ({ matches }) => {
    const pathname = matches.at(-1)?.pathname ?? '/'
    const canonicalUrl = new URL(pathname, SITE_URL).toString()

    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width' },

        // Google Site Verification
        { name: 'google-site-verification', content: 'google34f30110b42c1453' },

        // Primary Meta Tags
        { title: TITLE },
        { name: 'title', content: TITLE },
        { name: 'description', content: DESCRIPTION },
        { name: 'author', content: 'Leo Felcianas' },
        {
          name: 'keywords',
          content:
            'DevOps Engineer, Software Developer, Backend Developer, Cloud Architecture, Containerization, CI/CD, Kubernetes, Docker, NestJS, TypeScript',
        },
        { name: 'msapplication-TileColor', content: '#1a1b26' },
        { name: 'theme-color', content: '#1a1b26' },
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
        { name: 'revisit-after', content: '7 days' },
        { name: 'rating', content: 'general' },

        // Web App Manifest
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Leo Felcianas' },

        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:title', content: TITLE },
        { property: 'og:description', content: DESCRIPTION },
        { property: 'og:image', content: OG_IMAGE_URL },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:site_name', content: 'Leo Felcianas' },

        // Twitter
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:url', content: canonicalUrl },
        { property: 'twitter:title', content: TITLE },
        { property: 'twitter:description', content: DESCRIPTION },
        { property: 'twitter:image', content: OG_IMAGE_URL },

        { name: 'view-transition', content: 'same-origin' },
      ],
      links: [
        { rel: 'stylesheet', href: appCss },

        { rel: 'canonical', href: canonicalUrl },

        // Favicons
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90' font-family='Fira Code' font-weight='bold' text-anchor='middle' x='50' y='50' dominant-baseline='middle' fill='%237aa2f7'>LF</text></svg>",
        },

        // Web App Manifest
        { rel: 'manifest', href: '/manifest.json' },

        // Preconnect to external resources
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap',
        },
      ],
      scripts: [
        // Structured Data / JSON-LD — Person schema (Layout.astro:89-108)
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Leo Felcianas',
            jobTitle: 'DevOps Engineer & Software Developer',
            description: DESCRIPTION,
            url: 'https://itsme.dfanso.dev/',
            image: PROFILE_IMAGE_URL,
            sameAs: ['https://github.com/dfanso', 'https://linkedin.com/in/dfanso'],
            alumniOf: {
              '@type': 'CollegeOrUniversity',
              name: 'University of Plymouth',
              sameAs: 'https://www.plymouth.ac.uk/',
            },
            knowsAbout: [
              'DevOps',
              'Cloud Architecture',
              'Backend Development',
              'Kubernetes',
              'Docker',
              'NestJS',
              'TypeScript',
            ],
          }),
        },
        // Structured Data / JSON-LD — WebSite schema (Layout.astro:135-147)
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Leo Felcianas Portfolio',
            url: 'https://itsme.dfanso.dev/',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://itsme.dfanso.dev/?s={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        },
      ],
    }
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[var(--bg)] text-[var(--text)] h-screen overflow-hidden font-mono selection:bg-[var(--primary)] selection:text-[var(--bg)]">
        <div className="fixed inset-0 -z-10 bg-[var(--bg)]">
          <div className="absolute inset-0 bg-[var(--bg)]" />
        </div>
        <main className="relative h-full">{children}</main>

        <CrtOverlay />

        <Analytics />
        <SpeedInsights />
        <Scripts />
      </body>
    </html>
  )
}
