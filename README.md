# DFanso's Terminal Portfolio

A unique terminal-style portfolio built with Astro and TypeScript, providing an interactive command-line interface to explore my work and experience.

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

![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![GitHub GraphQL](https://img.shields.io/badge/GitHub_GraphQL-181717?style=for-the-badge&logo=github&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

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
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Optional | GitHub personal access token for full stats |

Without the token, basic GitHub stats (stars, forks, repos) will still work via the public API.

## Project Commands

| Command | Action |
|---------|--------|
| `yarn install` | Install dependencies |
| `yarn dev` | Start local dev server at `localhost:4321` |
| `yarn build` | Build production site to `./dist/` |
| `yarn preview` | Preview build locally |
| `yarn astro ...` | Run Astro CLI commands |

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
