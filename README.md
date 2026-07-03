# DFanso's Terminal Portfolio

A unique terminal-style portfolio built with TanStack Start, React and TypeScript, providing an interactive command-line interface to explore my work and experience.

## Live Site

Visit my portfolio at [itsme.dfanso.dev](https://itsme.dfanso.dev)

## Features

### Terminal Interface
- Interactive command-line experience
- Real terminal-like behavior
- Command history navigation (Arrow Up/Down keys)
- Tab auto-completion with suggestions
- Custom prompt styling and cursor animation
- Syntax highlighting for commands

### Available Commands

| Command | Description |
|---------|-------------|
| `help` | Show all available commands |
| `whoami` | Display profile information |
| `about` | View professional summary |
| `projects` | Browse featured projects with GitHub stats |
| `skills` | List technical expertise |
| `experience` | View work history |
| `education` | View academic background |
| `certifications` | View professional certificates |
| `contact` | Get contact information |
| `github` | Show GitHub stats and contributions |
| `clear` | Clear terminal screen (Ctrl+L) |
| `ls` | List available sections |
| `neofetch` | Display system information |
| `resume` | Download/view resume |

### GitHub Integration
- Contribution graph (heatmap)
- Language statistics with visual bar
- Commits, PRs, and issues count
- Pinned repositories display
- Repository stats (stars, forks)

### Visual Effects
- ASCII art banner with glow effect
- Typewriter animation on first visit
- Scanline CRT terminal effect
- Smooth staggered line animations
- Dynamic time-based greetings

## Tech Stack

![TanStack Start](https://img.shields.io/badge/TanStack_Start-FF4154?style=for-the-badge&logo=react&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![GitHub GraphQL](https://img.shields.io/badge/GitHub_GraphQL-181717?style=for-the-badge&logo=github&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

Built on [TanStack Start](https://tanstack.com/start) (React 19 + [TanStack Router](https://tanstack.com/router), server-rendered and prerendered via [Nitro](https://nitro.build/)), styled with Tailwind CSS v4, animated with anime.js, tested with [Vitest](https://vitest.dev/), and deployed to Vercel.

## Development

### Prerequisites
- Node.js 18+
- Yarn package manager

### Setup

1. Clone the repository:
```bash
git clone https://github.com/dfanso/itsme.dfanso.dev.git
cd itsme.dfanso.dev
```

2. Install dependencies:
```bash
yarn install
```

3. Create environment file (optional, for GitHub stats):
```bash
cp .env.example .env
# Add your GITHUB_TOKEN
```

4. Start development server:
```bash
yarn dev
```

5. Build for production:
```bash
yarn build
yarn start
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Optional | GitHub personal access token, used by the `github` command's server function (`src/lib/github-server-fn.ts`) for full stats (contribution graph, commits, PRs, issues, pinned repos) |

Without the token — or if the GitHub API request fails — the `github` command falls back to a "Unable to fetch GitHub data" message. Set `GITHUB_TOKEN` as a project environment variable in the Vercel dashboard for the deployed site (Settings → Environment Variables); it isn't read from `.env` in production, only during local `yarn dev`.

## Project Commands

| Command | Action |
|---------|--------|
| `yarn install` | Install dependencies |
| `yarn dev` | Start local dev server at `localhost:3000` |
| `yarn build` | Build the production app (prerendered `/` + `/resume`, SSR server, static assets) to `./.output/` |
| `yarn start` | Run the production build (`node .output/server/index.mjs`) |
| `yarn test` | Run the Vitest test suite (`yarn test run` for a single non-watch run) |
| `yarn generate:cv` | Regenerate `public/resume.pdf` from the portfolio data |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Arrow Up/Down` | Navigate command history |
| `Tab` | Auto-complete commands |
| `Ctrl + L` | Clear screen |
| `Ctrl + C` | Copy selected text |
| `Ctrl + V` | Paste text |

## Mobile Support

- Responsive layout and typography
- Touch-friendly interface
- Dedicated mobile view for small screens

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Created by [DFanso](https://github.com/dfanso)

Feel free to reach out on [GitHub](https://github.com/dfanso) or through my portfolio site!
