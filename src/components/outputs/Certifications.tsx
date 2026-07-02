/**
 * Ported 1:1 from src-astro/components/Certifications.astro (registered
 * under the `certifications` command). `class` prop and inner
 * `command-output` div dropped for the same reason noted in About.tsx. The
 * Astro source also imports `Icon` from `astro-icon/components` and puts an
 * `icon` field on each entry, but never actually renders an `<Icon />` —
 * that import/field is dead code in the source, so it's dropped here too
 * rather than porting an icon that was never displayed.
 */
interface Certification {
  name: string
  issuer: string
  date: string
  expiry?: string
  id?: string
}

const certifications: Certification[] = [
  {
    name: 'Multicloud Network Associate',
    issuer: 'Aviatrix',
    date: 'Issued Sep 2025',
    expiry: 'Expires Sep 2028',
    id: 'Credential ID 2025-27675',
  },
  {
    name: 'AWS Cloud Practitioner Essentials',
    issuer: 'Amazon Web Services (AWS)',
    date: 'Issued May 2025',
  },
]

export function Certifications() {
  return (
    <section>
      <div className="text-[#bb9af7] font-bold mb-2">Certifications</div>
      <div className="space-y-4">
        {certifications.map((cert) => (
          <div className="cert-entry" key={cert.name}>
            <div className="flex items-center gap-2 text-[#7aa2f7]">
              <span className="text-[#565f89]">└─▶</span>
              <span className="text-[#e0af68]">{cert.name}</span>
            </div>
            <div className="ml-6 mt-1 flex items-center gap-2 text-xs">
              <span className="text-[#9ece6a]">{cert.issuer}</span>
              {cert.id && (
                <>
                  <span className="text-[#565f89]">|</span>
                  <span className="text-[#565f89]">{cert.id}</span>
                </>
              )}
            </div>
            <div className="ml-6 mt-1 text-[#565f89] text-xs">
              {cert.date} {cert.expiry ? `• ${cert.expiry}` : ''}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
