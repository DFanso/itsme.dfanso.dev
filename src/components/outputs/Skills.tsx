import type { ComponentType } from 'react'
import LucideArrowRightLeftIcon from '~icons/lucide/arrow-right-left'
import LucideBlocksIcon from '~icons/lucide/blocks'
import LucideBriefcaseIcon from '~icons/lucide/briefcase'
import LucideCpuIcon from '~icons/lucide/cpu'
import LucideCrosshairIcon from '~icons/lucide/crosshair'
import LucideDatabaseIcon from '~icons/lucide/database'
import LucideGitBranchIcon from '~icons/lucide/git-branch'
import LucideGitPullRequestIcon from '~icons/lucide/git-pull-request'
import LucideGlobeIcon from '~icons/lucide/globe'
import LucideLayersIcon from '~icons/lucide/layers'
import LucideShieldCheckIcon from '~icons/lucide/shield-check'
import MdiMicrosoftAzureIcon from '~icons/mdi/microsoft-azure'
import AmazonawsIcon from '~icons/simple-icons/amazonaws'
import AmazonecsIcon from '~icons/simple-icons/amazonecs'
import AnsibleIcon from '~icons/simple-icons/ansible'
import ArgoIcon from '~icons/simple-icons/argo'
import AwslambdaIcon from '~icons/simple-icons/awslambda'
import CloudflareIcon from '~icons/simple-icons/cloudflare'
import CsharpIcon from '~icons/simple-icons/csharp'
import DockerIcon from '~icons/simple-icons/docker'
import DotnetIcon from '~icons/simple-icons/dotnet'
import ElasticIcon from '~icons/simple-icons/elastic'
import EleventyIcon from '~icons/simple-icons/eleventy'
import FastapiIcon from '~icons/simple-icons/fastapi'
import FirebaseIcon from '~icons/simple-icons/firebase'
import GithubactionsIcon from '~icons/simple-icons/githubactions'
import GoIcon from '~icons/simple-icons/go'
import GooglecloudIcon from '~icons/simple-icons/googlecloud'
import GrafanaIcon from '~icons/simple-icons/grafana'
import GraphqlIcon from '~icons/simple-icons/graphql'
import HelmIcon from '~icons/simple-icons/helm'
import HtmxIcon from '~icons/simple-icons/htmx'
import JavascriptIcon from '~icons/simple-icons/javascript'
import JenkinsIcon from '~icons/simple-icons/jenkins'
import K3sIcon from '~icons/simple-icons/k3s'
import KubernetesIcon from '~icons/simple-icons/kubernetes'
import LangchainIcon from '~icons/simple-icons/langchain'
import LinuxIcon from '~icons/simple-icons/linux'
import MongodbIcon from '~icons/simple-icons/mongodb'
import MysqlIcon from '~icons/simple-icons/mysql'
import NestjsIcon from '~icons/simple-icons/nestjs'
import NextdotjsIcon from '~icons/simple-icons/nextdotjs'
import NginxIcon from '~icons/simple-icons/nginx'
import NodedotjsIcon from '~icons/simple-icons/nodedotjs'
import OpenaiIcon from '~icons/simple-icons/openai'
import PackerIcon from '~icons/simple-icons/packer'
import PostgresqlIcon from '~icons/simple-icons/postgresql'
import PrismaIcon from '~icons/simple-icons/prisma'
import PrometheusIcon from '~icons/simple-icons/prometheus'
import PythonIcon from '~icons/simple-icons/python'
import ReactIcon from '~icons/simple-icons/react'
import RedisIcon from '~icons/simple-icons/redis'
import RustIcon from '~icons/simple-icons/rust'
import TailwindcssIcon from '~icons/simple-icons/tailwindcss'
import TerraformIcon from '~icons/simple-icons/terraform'
import TypescriptIcon from '~icons/simple-icons/typescript'
import VercelIcon from '~icons/simple-icons/vercel'

/**
 * Ported 1:1 from src-astro/components/Skills.astro (registered under the
 * `skills` command). `class` prop and inner `command-output` div dropped
 * for the same reason noted in About.tsx. astro-icon's dynamic
 * `<Icon name={skill.icon} />` (a runtime string) becomes a lookup into
 * `ICONS`, a map of statically-imported unplugin-icons components keyed by
 * the same `"collection:name"` string the Astro source used — icons need
 * build-time-resolvable import paths, so every distinct icon referenced by
 * `skillCategories` gets one static import, and the `skill.icon` field is
 * kept (unlike Contact.tsx's small fixed list) since ~57 distinct icons
 * recur across ~80 skill entries here.
 */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  'lucide:arrow-right-left': LucideArrowRightLeftIcon,
  'lucide:blocks': LucideBlocksIcon,
  'lucide:briefcase': LucideBriefcaseIcon,
  'lucide:cpu': LucideCpuIcon,
  'lucide:crosshair': LucideCrosshairIcon,
  'lucide:database': LucideDatabaseIcon,
  'lucide:git-branch': LucideGitBranchIcon,
  'lucide:git-pull-request': LucideGitPullRequestIcon,
  'lucide:globe': LucideGlobeIcon,
  'lucide:layers': LucideLayersIcon,
  'lucide:shield-check': LucideShieldCheckIcon,
  'mdi:microsoft-azure': MdiMicrosoftAzureIcon,
  'simple-icons:amazonaws': AmazonawsIcon,
  'simple-icons:amazonecs': AmazonecsIcon,
  'simple-icons:ansible': AnsibleIcon,
  'simple-icons:argo': ArgoIcon,
  'simple-icons:awslambda': AwslambdaIcon,
  'simple-icons:cloudflare': CloudflareIcon,
  'simple-icons:csharp': CsharpIcon,
  'simple-icons:docker': DockerIcon,
  'simple-icons:dotnet': DotnetIcon,
  'simple-icons:elastic': ElasticIcon,
  'simple-icons:eleventy': EleventyIcon,
  'simple-icons:fastapi': FastapiIcon,
  'simple-icons:firebase': FirebaseIcon,
  'simple-icons:githubactions': GithubactionsIcon,
  'simple-icons:go': GoIcon,
  'simple-icons:googlecloud': GooglecloudIcon,
  'simple-icons:grafana': GrafanaIcon,
  'simple-icons:graphql': GraphqlIcon,
  'simple-icons:helm': HelmIcon,
  'simple-icons:htmx': HtmxIcon,
  'simple-icons:javascript': JavascriptIcon,
  'simple-icons:jenkins': JenkinsIcon,
  'simple-icons:k3s': K3sIcon,
  'simple-icons:kubernetes': KubernetesIcon,
  'simple-icons:langchain': LangchainIcon,
  'simple-icons:linux': LinuxIcon,
  'simple-icons:mongodb': MongodbIcon,
  'simple-icons:mysql': MysqlIcon,
  'simple-icons:nestjs': NestjsIcon,
  'simple-icons:nextdotjs': NextdotjsIcon,
  'simple-icons:nginx': NginxIcon,
  'simple-icons:nodedotjs': NodedotjsIcon,
  'simple-icons:openai': OpenaiIcon,
  'simple-icons:packer': PackerIcon,
  'simple-icons:postgresql': PostgresqlIcon,
  'simple-icons:prisma': PrismaIcon,
  'simple-icons:prometheus': PrometheusIcon,
  'simple-icons:python': PythonIcon,
  'simple-icons:react': ReactIcon,
  'simple-icons:redis': RedisIcon,
  'simple-icons:rust': RustIcon,
  'simple-icons:tailwindcss': TailwindcssIcon,
  'simple-icons:terraform': TerraformIcon,
  'simple-icons:typescript': TypescriptIcon,
  'simple-icons:vercel': VercelIcon,
}

const skillCategories = [
  {
    name: 'cloud',
    skills: [
      { icon: 'simple-icons:amazonaws', name: 'AWS' },
      { icon: 'simple-icons:googlecloud', name: 'GCP' },
      { icon: 'mdi:microsoft-azure', name: 'Azure' },
      { icon: 'simple-icons:cloudflare', name: 'Cloudflare' },
    ],
  },
  {
    name: 'containers',
    skills: [
      { icon: 'simple-icons:docker', name: 'Docker' },
      { icon: 'simple-icons:kubernetes', name: 'Kubernetes' },
      { icon: 'simple-icons:k3s', name: 'K3s' },
      { icon: 'simple-icons:amazonecs', name: 'ECS' },
      { icon: 'simple-icons:elastic', name: 'ELK' },
    ],
  },
  {
    name: 'infra',
    skills: [
      { icon: 'simple-icons:linux', name: 'Linux' },
      { icon: 'simple-icons:helm', name: 'Helm' },
      { icon: 'simple-icons:nginx', name: 'Nginx' },
      { icon: 'simple-icons:terraform', name: 'Terraform' },
      { icon: 'simple-icons:packer', name: 'Packer' },
      { icon: 'simple-icons:ansible', name: 'Ansible' },
      { icon: 'simple-icons:jenkins', name: 'Jenkins' },
      { icon: 'simple-icons:githubactions', name: 'GitHub Actions' },
      { icon: 'simple-icons:argo', name: 'ArgoCD' },
      { icon: 'lucide:git-pull-request', name: 'GitOps' },
      { icon: 'lucide:crosshair', name: 'Artillery' },
    ],
  },
  {
    name: 'lang',
    skills: [
      { icon: 'simple-icons:go', name: 'Go' },
      { icon: 'simple-icons:rust', name: 'Rust' },
      { icon: 'simple-icons:python', name: 'Python' },
      { icon: 'simple-icons:typescript', name: 'TypeScript' },
      { icon: 'simple-icons:javascript', name: 'JavaScript' },
      { icon: 'simple-icons:nodedotjs', name: 'Node.js' },
      { icon: 'simple-icons:csharp', name: 'C#' },
    ],
  },
  {
    name: 'frameworks',
    skills: [
      { icon: 'simple-icons:nextdotjs', name: 'Next.js' },
      { icon: 'simple-icons:fastapi', name: 'FastAPI' },
      { icon: 'simple-icons:eleventy', name: '11ty' },
      { icon: 'simple-icons:nestjs', name: 'Nest.js' },
      { icon: 'simple-icons:go', name: 'Fiber' },
      { icon: 'simple-icons:htmx', name: 'HTMX' },
      { icon: 'simple-icons:tailwindcss', name: 'Tailwind' },
      { icon: 'simple-icons:graphql', name: 'GraphQL' },
      { icon: 'simple-icons:react', name: 'React Native' },
      { icon: 'simple-icons:dotnet', name: '.NET Core' },
      { icon: 'simple-icons:dotnet', name: 'EF Core' },
    ],
  },
  {
    name: 'ai',
    skills: [
      { icon: 'simple-icons:openai', name: 'OpenAI' },
      { icon: 'simple-icons:langchain', name: 'LangChain' },
      { icon: 'simple-icons:python', name: 'AI Automation' },
    ],
  },
  {
    name: 'db',
    skills: [
      { icon: 'simple-icons:postgresql', name: 'PostgreSQL' },
      { icon: 'simple-icons:mysql', name: 'MySQL' },
      { icon: 'simple-icons:mongodb', name: 'MongoDB' },
      { icon: 'simple-icons:redis', name: 'Redis' },
      { icon: 'simple-icons:firebase', name: 'Firebase' },
      { icon: 'simple-icons:prisma', name: 'Prisma' },
      { icon: 'simple-icons:go', name: 'GORM' },
    ],
  },
  {
    name: 'serverless',
    skills: [
      { icon: 'simple-icons:vercel', name: 'Vercel' },
      { icon: 'simple-icons:amazonaws', name: 'App Runner' },
      { icon: 'mdi:microsoft-azure', name: 'App Service' },
      { icon: 'simple-icons:awslambda', name: 'Lambda' },
      { icon: 'simple-icons:cloudflare', name: 'Workers' },
      { icon: 'lucide:database', name: 'Convex' },
    ],
  },
  {
    name: 'monitor',
    skills: [
      { icon: 'simple-icons:prometheus', name: 'Prometheus' },
      { icon: 'simple-icons:grafana', name: 'Grafana' },
      { icon: 'simple-icons:grafana', name: 'Loki' },
      { icon: 'simple-icons:grafana', name: 'Tempo' },
      { icon: 'simple-icons:grafana', name: 'Mimir' },
      { icon: 'simple-icons:elastic', name: 'ELK Stack' },
      { icon: 'lucide:shield-check', name: 'Rapid7' },
    ],
  },
  {
    name: 'arch',
    skills: [
      { icon: 'lucide:blocks', name: 'Microservices' },
      { icon: 'lucide:cpu', name: 'System Design' },
      { icon: 'lucide:globe', name: 'Network Security' },
      { icon: 'lucide:briefcase', name: 'Technical Product Management' },
      { icon: 'lucide:git-branch', name: 'REST / GraphQL APIs' },
      { icon: 'lucide:layers', name: 'Clean Architecture' },
      { icon: 'lucide:arrow-right-left', name: 'CQRS / Mediator' },
    ],
  },
]

export function Skills() {
  return (
    <section>
      <div className="text-[#bb9af7] font-bold mb-2">Technical Skills</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillCategories.map((category, index) => (
          <div className="skill-category" key={category.name}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#a9b1d6]">
                {index === skillCategories.length - 1 ? '└─▶' : '├─▶'}
              </span>
              <span className="text-[#e0af68]">ls</span>
              <span className="text-[#7aa2f7]">~/{category.name}/</span>
            </div>
            <div className="ml-6 flex flex-wrap gap-4">
              {category.skills.map((skill) => {
                const SkillIcon = ICONS[skill.icon]
                return (
                  <div className="flex items-center gap-1" key={skill.name}>
                    <span className="text-[#a9b1d6]">│</span>
                    <span className="text-[#7aa2f7]">
                      <SkillIcon className="w-4 h-4" />
                    </span>
                    <span className="text-[#9ece6a]">{skill.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
