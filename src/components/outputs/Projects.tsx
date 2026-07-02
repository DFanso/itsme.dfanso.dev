import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import type { ProjectRepoStats } from '../../lib/github-fetch'
import { getProjectStats } from '../../lib/github-server-fn'
import LucideBrainIcon from '~icons/lucide/brain'
import LucideEyeIcon from '~icons/lucide/eye'
import LucideGitForkIcon from '~icons/lucide/git-fork'
import LucideStarIcon from '~icons/lucide/star'
import AmazonawsIcon from '~icons/simple-icons/amazonaws'
import ArgoIcon from '~icons/simple-icons/argo'
import DatadogIcon from '~icons/simple-icons/datadog'
import FastapiIcon from '~icons/simple-icons/fastapi'
import FirebaseIcon from '~icons/simple-icons/firebase'
import GithubactionsIcon from '~icons/simple-icons/githubactions'
import GoIcon from '~icons/simple-icons/go'
import GrafanaIcon from '~icons/simple-icons/grafana'
import HelmIcon from '~icons/simple-icons/helm'
import HtmxIcon from '~icons/simple-icons/htmx'
import KubernetesIcon from '~icons/simple-icons/kubernetes'
import MongodbIcon from '~icons/simple-icons/mongodb'
import NestjsIcon from '~icons/simple-icons/nestjs'
import NextdotjsIcon from '~icons/simple-icons/nextdotjs'
import NginxIcon from '~icons/simple-icons/nginx'
import PaypalIcon from '~icons/simple-icons/paypal'
import PrometheusIcon from '~icons/simple-icons/prometheus'
import PythonIcon from '~icons/simple-icons/python'
import StripeIcon from '~icons/simple-icons/stripe'
import TailwindcssIcon from '~icons/simple-icons/tailwindcss'
import TerraformIcon from '~icons/simple-icons/terraform'

/**
 * Ported 1:1 from src-astro/components/Projects.astro (registered under the
 * `projects` command). `class` prop and inner `command-output` div dropped
 * for the same reason noted in About.tsx. astro-icon's dynamic
 * `<Icon name={...} />` becomes a lookup into `ICONS` (see Skills.tsx for
 * the same pattern).
 *
 * The Astro source also called the GitHub REST API at build time
 * (`getGitHubStats`) to annotate each project with live star/fork/watcher
 * counts rendered next to its heading (Projects.astro:150-165). Ported here
 * as a client-side fetch on mount via the `getProjectStats` server function
 * (`fetchProjectStats` in `github-fetch.ts`, wrapped in `github-server-fn.ts`)
 * instead — stats arrive live per visit rather than frozen at build time.
 * `getProjectStats` is imported normally, same as in `GitHubStats.tsx` (see
 * that file's doc comment for why a static import here is safe under
 * Vitest). A repo whose stats fetch fails just renders without the stats
 * row, matching Projects.astro's graceful per-project `stats: null` behavior.
 *
 * The old site appended a static "Would you like to see more projects?"
 * prompt line to this command's *output* (src-astro/pages/index.astro:
 * 866-876) — but that echoed text was disconnected from the live input
 * line below it, where the user's y/n answer actually appeared next to an
 * unrelated `dfanso@terminal` prompt. The accessibility pass (commit
 * 3d056be) fixed that by dropping the static echo entirely and instead
 * swapping the *input line's own prompt* to the question while
 * `awaitingProjectResponse` is true (see `Prompt.tsx`), so the typed answer
 * renders inline right after "(y/n)". This component therefore renders only
 * the project list — no trailing prompt line — and `commands.tsx`/
 * `terminal-reducer.ts` drive `awaitingProjectResponse` the same way they
 * already did before this port.
 */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  'lucide:brain': LucideBrainIcon,
  'simple-icons:amazonaws': AmazonawsIcon,
  'simple-icons:argo': ArgoIcon,
  'simple-icons:datadog': DatadogIcon,
  'simple-icons:fastapi': FastapiIcon,
  'simple-icons:firebase': FirebaseIcon,
  'simple-icons:githubactions': GithubactionsIcon,
  'simple-icons:go': GoIcon,
  'simple-icons:grafana': GrafanaIcon,
  'simple-icons:helm': HelmIcon,
  'simple-icons:htmx': HtmxIcon,
  'simple-icons:kubernetes': KubernetesIcon,
  'simple-icons:mongodb': MongodbIcon,
  'simple-icons:nestjs': NestjsIcon,
  'simple-icons:nextdotjs': NextdotjsIcon,
  'simple-icons:nginx': NginxIcon,
  'simple-icons:paypal': PaypalIcon,
  'simple-icons:prometheus': PrometheusIcon,
  'simple-icons:python': PythonIcon,
  'simple-icons:stripe': StripeIcon,
  'simple-icons:tailwindcss': TailwindcssIcon,
  'simple-icons:terraform': TerraformIcon,
}

const projectsData = [
  {
    type: 'OPS',
    name: 'eks-gitops-platform',
    url: 'https://github.com/DFanso?tab=repositories&q=DevOps-Project-001&type=&language=&sort=',
    github: 'DFanso/DevOps-Project-001',
    description:
      'Production-grade 3-repo GitOps platform on AWS EKS with Terraform IaC, GitHub Actions CI, and ArgoCD for continuous deployment with DataDog observability.',
    tech: [
      { icon: 'simple-icons:amazonaws', name: 'AWS EKS' },
      { icon: 'simple-icons:terraform', name: 'Terraform' },
      { icon: 'simple-icons:kubernetes', name: 'Kubernetes' },
      { icon: 'simple-icons:helm', name: 'Helm' },
      { icon: 'simple-icons:argo', name: 'ArgoCD' },
      { icon: 'simple-icons:datadog', name: 'DataDog' },
      { icon: 'simple-icons:githubactions', name: 'GitHub Actions' },
      { icon: 'simple-icons:go', name: 'Go' },
    ],
  },
  {
    type: 'OPS',
    name: 'k3s-cicd',
    url: 'https://github.com/DFanso/k3s',
    github: 'DFanso/k3s',
    description:
      'A complete Kubernetes deployment setup with automated CI/CD using GitHub Actions, Helm, and full observability stack.',
    tech: [
      { icon: 'simple-icons:kubernetes', name: 'K3s' },
      { icon: 'simple-icons:githubactions', name: 'GitHub Actions' },
      { icon: 'simple-icons:helm', name: 'Helm' },
      { icon: 'simple-icons:prometheus', name: 'Prometheus' },
      { icon: 'simple-icons:grafana', name: 'Grafana' },
      { icon: 'simple-icons:nginx', name: 'Nginx' },
      { icon: 'simple-icons:fastapi', name: 'FastAPI' },
    ],
  },
  {
    type: 'WEB',
    name: 'techxeed',
    url: 'https://www.techxeed.com/',
    github: null,
    description:
      'A comprehensive digital solutions platform offering web development, mobile apps, \nAI solutions, and digital marketing services.',
    tech: [
      { icon: 'simple-icons:nextdotjs', name: 'Next.js' },
      { icon: 'simple-icons:nestjs', name: 'Nest.js' },
      { icon: 'simple-icons:mongodb', name: 'MongoDB' },
      { icon: 'simple-icons:tailwindcss', name: 'TailwindCSS' },
      { icon: 'simple-icons:firebase', name: 'Firebase' },
      { icon: 'simple-icons:amazonaws', name: 'AWS' },
      { icon: 'simple-icons:stripe', name: 'Stripe' },
      { icon: 'simple-icons:terraform', name: 'Terraform' },
    ],
  },
  {
    type: 'APP',
    name: 'quickquest',
    url: 'https://github.com/DFanso/QuickQuest',
    github: 'DFanso/QuickQuest',
    description:
      'A location-based platform connecting customers with laborers, featuring real-time chat \nvia SSE and geospatial queries.',
    tech: [
      { icon: 'simple-icons:nextdotjs', name: 'Next.js' },
      { icon: 'simple-icons:nestjs', name: 'Nest.js' },
      { icon: 'simple-icons:mongodb', name: 'MongoDB' },
      { icon: 'simple-icons:python', name: 'Python' },
      { icon: 'simple-icons:amazonaws', name: 'AWS' },
      { icon: 'simple-icons:paypal', name: 'PayPal' },
    ],
  },
  {
    type: 'APP',
    name: 'rss-reader',
    url: 'https://github.com/DFanso/rss',
    github: 'DFanso/rss',
    description:
      'A simple, modern RSS reader and generator built with Go and HTMX, featuring \npersistent storage and a clean UI.',
    tech: [
      { icon: 'simple-icons:go', name: 'Go' },
      { icon: 'simple-icons:htmx', name: 'HTMX' },
      { icon: 'simple-icons:tailwindcss', name: 'TailwindCSS' },
    ],
  },
  {
    type: 'CLI',
    name: 'commit-msg',
    url: 'https://github.com/DFanso/commit-msg',
    github: 'DFanso/commit-msg',
    description:
      'AI-powered CLI tool that generates conventional commit messages using various \nLLMs including Gemini, Grok, and OpenAI.',
    tech: [
      { icon: 'simple-icons:go', name: 'Go' },
      { icon: 'lucide:brain', name: 'LLMs' },
    ],
  },
  {
    type: 'OPS',
    name: 'aws-ecs-infra',
    url: 'https://github.com/DFanso/aws-ecs-infrastructure',
    github: 'DFanso/aws-ecs-infrastructure',
    description:
      'Infrastructure as Code configurations for deploying scalable applications on \nAWS ECS using Terraform.',
    tech: [
      { icon: 'simple-icons:terraform', name: 'Terraform' },
      { icon: 'simple-icons:amazonaws', name: 'AWS' },
    ],
  },
]

export function Projects() {
  const [stats, setStats] = useState<Record<string, ProjectRepoStats | null>>({})

  useEffect(() => {
    const repos = projectsData
      .map((project) => project.github)
      .filter((github): github is string => github !== null)
    let cancelled = false
    getProjectStats({ data: repos })
      .then((result) => {
        if (!cancelled) setStats(result)
      })
      .catch(() => {
        // Graceful degradation matches Projects.astro: a failed fetch just
        // means no stats rows render (stats stays empty), not an error state.
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section>
      <div className="text-[#bb9af7] font-bold mb-2">Featured Projects</div>
      <div className="space-y-6">
        {projectsData.map((project, index) => {
          const projectStats = project.github ? stats[project.github] : null
          return (
            <div className="project-entry" key={project.name}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#a9b1d6]">
                  {index === projectsData.length - 1 ? '└─▶' : '├─▶'}
                </span>
                <span className="text-[#e0af68]">cat</span>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7aa2f7] hover:underline"
                >
                  projects/{project.name}/
                </a>
                <span className="text-[#a9b1d6]">type:</span>
                <span className="text-[#f7768e]">{project.type}</span>
                {projectStats && (
                  <div className="flex items-center gap-3 ml-2">
                    <span className="flex items-center gap-1 text-[#e0af68]">
                      <LucideStarIcon className="w-3.5 h-3.5" />
                      <span className="text-sm">{projectStats.stars}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#7dcfff]">
                      <LucideGitForkIcon className="w-3.5 h-3.5" />
                      <span className="text-sm">{projectStats.forks}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#bb9af7]">
                      <LucideEyeIcon className="w-3.5 h-3.5" />
                      <span className="text-sm">{projectStats.watchers}</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-6 mt-2">
                <div className="text-[#c0caf5]">{project.description}</div>
                <div className="mt-2 flex flex-wrap gap-3">
                  {project.tech.map((tech) => {
                    const TechIcon = ICONS[tech.icon]
                    return (
                      <div className="flex items-center gap-1" key={tech.name}>
                        <span className="text-[#a9b1d6]">│</span>
                        <span className="text-[#7aa2f7]">
                          <TechIcon className="w-4 h-4" />
                        </span>
                        <span className="text-[#9ece6a] text-sm">{tech.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
