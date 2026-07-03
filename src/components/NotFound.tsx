// Ported from src-astro/pages/404.astro and src-astro/pages/[...any].astro
// (identical body markup in both source files).

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="flex flex-col items-center space-y-8 max-w-3xl">
        <h1 className="text-6xl font-bold text-[#7aa2f7]">404</h1>
        <h2 className="text-2xl font-semibold text-[#c0caf5]">Page Not Found</h2>
        <p className="text-[#a9b1d6] mb-8">The page you're looking for doesn't exist or has been moved.</p>

        <div className="command-line p-4 bg-[#24283b] rounded-md w-full max-w-lg text-left">
          <p className="mb-2"><span className="command-prompt">$</span> find-page --url="<span className="text-[#f7768e]">not-found</span>"</p>
          <p className="text-[#f7768e]">Error: Page not found in directory</p>
          <p className="mb-2"><span className="command-prompt">$</span> suggest-action</p>
          <p>You can try the following:</p>
          <ul className="list-disc pl-8 text-[#a9b1d6] mt-2">
            <li>Return to the <a href="/" className="text-[#7aa2f7] hover:underline">home page</a></li>
            <li>Check the URL for typos</li>
            <li>Contact me if you believe this is an error</li>
          </ul>
        </div>

        <a
          href="/"
          className="mt-6 px-6 py-2 bg-[#7aa2f7] text-[#1a1b26] rounded-md hover:bg-[#89b4fa] transition-colors font-medium"
        >
          Return Home
        </a>
      </div>
    </div>
  )
}
