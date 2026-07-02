/**
 * Ported 1:1 from src-astro/components/Education.astro (registered under
 * the `education` command). `class` prop and inner `command-output` div
 * dropped for the same reason noted in About.tsx.
 */
const education = [
  {
    degree: 'BSc in Computer Software Engineering',
    institution: 'University of Plymouth',
    grade: 'First-Class Honours',
    period: 'June 2021 - December 2024',
    location: 'Plymouth, United Kingdom',
    desc: 'Focused on backend development, automation, and infrastructure management.',
  },
  {
    degree: "Foundation Program for Bachelor's Degree",
    institution: 'NSBM Green University',
    grade: '',
    period: 'March 2020 - April 2021',
    location: 'Sri Lanka',
    desc: 'Foundation studies preparing for the undergraduate degree programme.',
  },
]

export function Education() {
  return (
    <section>
      <div className="text-[#bb9af7] font-bold mb-2">Education</div>
      <div className="space-y-4">
        {education.map((edu) => (
          <div className="education-entry" key={edu.degree}>
            <div className="flex items-center gap-2 text-[#7aa2f7]">
              <span className="text-[#565f89]">└─▶</span>
              <span className="text-[#e0af68]">{edu.degree}</span>
            </div>
            <div className="ml-6 mt-1 flex flex-wrap gap-x-4 text-xs">
              <span className="text-[#9ece6a]">{edu.institution}</span>
              <span className="text-[#565f89]">|</span>
              <span className="text-[#c0caf5]">{edu.location}</span>
              <span className="text-[#565f89]">|</span>
              <span className="text-[#f7768e]">{edu.grade}</span>
            </div>
            <div className="ml-6 mt-1 text-[#565f89] text-xs">{edu.period}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
