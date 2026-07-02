import profileImage from '../../assets/profile.webp'

/**
 * Ported 1:1 from src-astro/components/Header.astro (registered under the
 * `whoami` command). The `class` prop and the unused `avatarUrl` constant
 * from the Astro source are dropped: every Output component here takes no
 * props, and `avatarUrl` was never referenced by the original markup
 * (astro:assets' <Image> uses the imported `profileImage` instead). The
 * astro:assets `<Image>` (build-time optimized, `quality="max"`) becomes a
 * plain `<img>` pointing at the same Vite-imported asset.
 */
export function Whoami() {
  return (
    <header className="flex items-start gap-4">
      <pre className="text-[#7aa2f7] text-xs leading-4 mt-2"></pre>
      <div className="space-y-3">
        <img
          src={profileImage}
          alt="Leo Felcianas"
          width={96}
          height={96}
          className="rounded-full border-2 border-[#7aa2f7] sm:w-28 sm:h-28"
          loading="eager"
        />
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#7aa2f7] cursor">Leo Felcianas</h1>
          <p className="text-[#a9b1d6] text-xs sm:text-sm"> DevOps Engineer</p>
        </div>
      </div>
    </header>
  )
}
