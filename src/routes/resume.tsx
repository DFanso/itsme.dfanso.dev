import { createFileRoute } from '@tanstack/react-router'
import { certifications, companies, education, profile, skillGroups } from '../data/portfolio'

// Ported from src-astro/pages/resume.astro (362 lines) — a standalone,
// print-optimized CV page. Unlike every other page in this app, the Astro
// source did NOT use Layout.astro: it declared its own bare
// <html><head><body>, its own fonts, and a big page-local <style> block
// (grid-based A4 layout in mm units). Rendered here as a route mounted
// inside the shared root document (see __root.tsx) instead, so:
//  - the <style> block's `*`/`:root`/`body` selectors are rewritten to
//    hang off a `.resume-page` wrapper class (see RESUME_CSS below) rather
//    than dumped global, where they'd stomp the terminal page's own
//    `:root`/`body` rules in app.css.
//  - `.resume-page` is `position: fixed; inset: 0` with its own
//    `overflow-y: auto` — the root `<body>` is `h-screen overflow-hidden`
//    (built for the fixed-viewport terminal), which would otherwise clip
//    this page's content (an A4 sheet, taller than most viewports) instead
//    of letting it scroll like the original standalone document did.
const allExperience = companies.flatMap((c) => c.roles.map((r) => ({ company: c.company, ...r })))

const RESUME_URL = 'https://itsme.dfanso.dev/resume'
const TITLE = `${profile.name} — Resume`
const DESCRIPTION = `Resume of ${profile.name} — ${profile.title}`

export const Route = createFileRoute('/resume')({
  // Overrides __root.tsx's head() for this route. TanStack Router's
  // `HeadContent` walks matches leaf-first and dedupes `meta` entries by
  // `name`/`property` (first one seen, i.e. the most specific route, wins)
  // — see buildTagsFromMatches in
  // node_modules/@tanstack/react-router/dist/esm/headContentUtils.js — so
  // re-declaring the same name/property here cleanly overrides root's
  // title/description/og/twitter tags without needing to remove anything
  // from __root.tsx. `links`, however, are only deduped on exact
  // (rel+href+...) equality, NOT by `rel` — so simply re-declaring
  // `rel: 'canonical'` here would render TWO canonical links (root's
  // site-root one plus this one), which is exactly the kind of "conflicting
  // canonical" Google calls out as unpredictable. Root's canonical is
  // therefore made path-aware in __root.tsx (derived from the matched
  // route's pathname) instead of overridden per-route.
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'title', content: TITLE },
      { name: 'description', content: DESCRIPTION },
      { name: 'robots', content: 'noindex' },
      { name: 'googlebot', content: 'noindex, nofollow' },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: RESUME_URL },
      { property: 'twitter:title', content: TITLE },
      { property: 'twitter:description', content: DESCRIPTION },
      { property: 'twitter:url', content: RESUME_URL },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
      },
    ],
  }),
  component: ResumePage,
})

function ResumePage() {
  return (
    <div className="resume-page">
      <style>{RESUME_CSS}</style>
      <div className="page">
        {/* ─── Header ─────────────────────────────────────────── */}
        <header className="header">
          <div>
            <div className="header-name">{profile.name}</div>
            <div className="header-title">{profile.title}</div>
          </div>
          <div className="header-contact">
            <span>📍 {profile.location}</span>
            <span>
              ✉ <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </span>
            <span>
              🔗 <a href={profile.linkedin}>{profile.linkedinHandle}</a>
            </span>
            <span>
              🌐 <a href={profile.portfolio}>{profile.portfolioHandle}</a>
            </span>
            <span>
              💻 <a href={profile.github}>{profile.githubHandle}</a>
            </span>
          </div>
        </header>

        {/* ─── Sidebar ─────────────────────────────────────────── */}
        <aside className="sidebar">
          {/* Summary */}
          <div className="section">
            <div className="section-title">About</div>
            <p className="summary-text">{profile.summary}</p>
          </div>

          {/* Skills */}
          <div className="section">
            <div className="section-title">Technical Skills</div>
            {skillGroups.map((g) => (
              <div className="skill-group" key={g.name}>
                <div className="skill-group-name">{g.name}</div>
                <div className="skill-tags">
                  {g.skills.map((s) => (
                    <span className="skill-tag" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="section">
            <div className="section-title">Certifications</div>
            {certifications.map((cert) => (
              <div className="cert-item" key={cert.name}>
                <div className="cert-name">{cert.name}</div>
                <div className="cert-issuer">{cert.issuer}</div>
                <div className="cert-meta">
                  {cert.date}
                  {cert.expiry ? ` · ${cert.expiry}` : ''}
                </div>
                {cert.id && <div className="cert-meta">{cert.id}</div>}
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="section">
            <div className="section-title">Education</div>
            {education.map((edu) => (
              <div className="edu-item" key={edu.degree}>
                <div className="edu-degree">{edu.degree}</div>
                <div className="edu-institution">{edu.institution}</div>
                <div className="edu-meta">
                  {edu.period} · {edu.location}
                </div>
                {edu.grade && <div className="edu-grade">🏆 {edu.grade}</div>}
              </div>
            ))}
          </div>
        </aside>

        {/* ─── Main ─────────────────────────────────────────────── */}
        <main className="main">
          <div className="section">
            <div className="section-title">Experience</div>
            {allExperience.map((exp) => (
              <div className="exp-item" key={`${exp.company}-${exp.title}`}>
                <div className="exp-header">
                  <div className="exp-title">{exp.title}</div>
                  <div className="exp-period">{exp.period}</div>
                </div>
                <div className="exp-company">{exp.company}</div>
                <ul className="exp-bullets">
                  {exp.responsibilities.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <div className="exp-tech">
                  {exp.tech.map((t) => (
                    <span className="tech-tag" key={t.name}>
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

// Ported from resume.astro:21-268 (<style>). Every selector that was
// `*`/`:root`/`body` in the source is scoped under `.resume-page` below
// (either as the selector itself, in place of `:root`/`body`, or prefixed
// as a descendant combinator for everything else) so these rules can't leak
// onto the terminal page. `.resume-page` also carries a small addition not
// in the source — `position: fixed; inset: 0; overflow-y: auto; z-index: 1`
// — to escape the root document's `overflow-hidden` body (see the
// component-level comment above).
const RESUME_CSS = `
.resume-page, .resume-page *, .resume-page *::before, .resume-page *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.resume-page {
  --blue:    #2563eb;
  --dark:    #0f172a;
  --mid:     #334155;
  --muted:   #64748b;
  --light:   #f1f5f9;
  --border:  #e2e8f0;
  --accent:  #0ea5e9;
  --page-w:  210mm;
  --page-h:  297mm;

  position: fixed;
  inset: 0;
  z-index: 1;
  overflow-y: auto;

  font-family: 'Inter', sans-serif;
  font-size: 9.5pt;
  line-height: 1.5;
  color: var(--dark);
  background: #fff;
}

/* ─── Page Layout ──────────────────────────────── */
.resume-page .page {
  width: var(--page-w);
  min-height: var(--page-h);
  margin: 0 auto;
  background: #fff;
  display: grid;
  grid-template-columns: 62mm 1fr;
  grid-template-rows: auto 1fr;
}

/* ─── Header (full-width) ──────────────────────── */
.resume-page .header {
  grid-column: 1 / -1;
  background: var(--dark);
  color: #fff;
  padding: 14mm 12mm 10mm;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 8mm;
}

.resume-page .header-name {
  font-size: 22pt;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff;
  line-height: 1.1;
}

.resume-page .header-title {
  font-size: 9.5pt;
  color: #94a3b8;
  margin-top: 2mm;
  font-weight: 400;
}

.resume-page .header-contact {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2.5mm;
  font-size: 8pt;
  color: #cbd5e1;
  white-space: nowrap;
}

.resume-page .header-contact a {
  color: #93c5fd;
  text-decoration: none;
}

.resume-page .header-contact span { display: flex; align-items: center; gap: 1.5mm; }

/* ─── Sidebar ──────────────────────────────────── */
.resume-page .sidebar {
  background: var(--light);
  padding: 8mm 7mm;
  border-right: 1px solid var(--border);
}

/* ─── Main ─────────────────────────────────────── */
.resume-page .main {
  padding: 8mm 10mm 8mm 8mm;
}

/* ─── Section ──────────────────────────────────── */
.resume-page .section { margin-bottom: 6mm; }

.resume-page .section-title {
  font-size: 7pt;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue);
  border-bottom: 1.5px solid var(--blue);
  padding-bottom: 1.5mm;
  margin-bottom: 4mm;
}

/* ─── Experience ───────────────────────────────── */
.resume-page .exp-item { margin-bottom: 5mm; }
.resume-page .exp-item:last-child { margin-bottom: 0; }

.resume-page .exp-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 4mm;
}

.resume-page .exp-title {
  font-size: 9.5pt;
  font-weight: 600;
  color: var(--dark);
}

.resume-page .exp-period {
  font-size: 7.5pt;
  color: var(--muted);
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
}

.resume-page .exp-company {
  font-size: 8.5pt;
  color: var(--blue);
  font-weight: 500;
  margin-bottom: 1.5mm;
}

.resume-page .exp-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
}

.resume-page .exp-bullets li {
  font-size: 8.5pt;
  color: var(--mid);
  padding-left: 3.5mm;
  position: relative;
  line-height: 1.5;
  margin-bottom: 0.8mm;
}

.resume-page .exp-bullets li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-size: 7pt;
  top: 1px;
}

.resume-page .exp-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5mm;
  margin-top: 2mm;
}

.resume-page .tech-tag {
  font-size: 6.5pt;
  background: #e0f2fe;
  color: #0369a1;
  border: 0.5px solid #bae6fd;
  border-radius: 2px;
  padding: 0.5mm 2mm;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}

/* ─── Education ────────────────────────────────── */
.resume-page .edu-item { margin-bottom: 4mm; }
.resume-page .edu-degree { font-size: 9pt; font-weight: 600; color: var(--dark); }
.resume-page .edu-institution { font-size: 8.5pt; color: var(--blue); font-weight: 500; }
.resume-page .edu-meta { font-size: 7.5pt; color: var(--muted); margin-top: 0.5mm; }
.resume-page .edu-grade {
  display: inline-block;
  font-size: 7pt;
  background: #fef3c7;
  color: #92400e;
  border: 0.5px solid #fde68a;
  border-radius: 2px;
  padding: 0.5mm 2mm;
  font-weight: 600;
  margin-top: 1mm;
}

/* ─── Certifications ───────────────────────────── */
.resume-page .cert-item { margin-bottom: 3.5mm; }
.resume-page .cert-name { font-size: 8.5pt; font-weight: 600; color: var(--dark); }
.resume-page .cert-issuer { font-size: 8pt; color: var(--blue); font-weight: 500; }
.resume-page .cert-meta { font-size: 7pt; color: var(--muted); }

/* ─── Skills ───────────────────────────────────── */
.resume-page .skill-group { margin-bottom: 3.5mm; }
.resume-page .skill-group-name {
  font-size: 7.5pt;
  font-weight: 600;
  color: var(--mid);
  margin-bottom: 1.5mm;
}
.resume-page .skill-tags { display: flex; flex-wrap: wrap; gap: 1.5mm; }
.resume-page .skill-tag {
  font-size: 7pt;
  background: #fff;
  border: 0.5px solid var(--border);
  border-radius: 2px;
  padding: 0.5mm 2mm;
  color: var(--mid);
}

/* ─── Summary ──────────────────────────────────── */
.resume-page .summary-text {
  font-size: 8.5pt;
  color: var(--mid);
  line-height: 1.6;
}

/* ─── Links ────────────────────────────────────── */
.resume-page .contact-link {
  display: flex;
  flex-direction: column;
  gap: 2mm;
  font-size: 7.5pt;
}

.resume-page .contact-link a {
  color: var(--blue);
  text-decoration: none;
}

/* ─── Print ────────────────────────────────────── */
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  .resume-page { print-color-adjust: exact; -webkit-print-color-adjust: exact; position: static; overflow: visible; }
  .resume-page .page { width: 210mm; min-height: 297mm; }
}
`
