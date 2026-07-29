import type { ComponentType } from 'react'
import LucideBuildingIcon from '~icons/lucide/building'
import LucideBuilding2Icon from '~icons/lucide/building-2'
import LucideCode2Icon from '~icons/lucide/code-2'
import LucideCpuIcon from '~icons/lucide/cpu'
import LucideCrosshairIcon from '~icons/lucide/crosshair'
import LucideGamepad2Icon from '~icons/lucide/gamepad-2'
import LucideLayersIcon from '~icons/lucide/layers'
import LucidePaletteIcon from '~icons/lucide/palette'
import LucideShare2Icon from '~icons/lucide/share-2'
import LucideShieldCheckIcon from '~icons/lucide/shield-check'
import MdiMicrosoftAzureIcon from '~icons/mdi/microsoft-azure'
import AdobeaftereffectsIcon from '~icons/simple-icons/adobeaftereffects'
import AdobepremiereproIcon from '~icons/simple-icons/adobepremierepro'
import AmazonawsIcon from '~icons/simple-icons/amazonaws'
import AzuredevopsIcon from '~icons/simple-icons/azuredevops'
import CloudflareIcon from '~icons/simple-icons/cloudflare'
import CsharpIcon from '~icons/simple-icons/csharp'
import DockerIcon from '~icons/simple-icons/docker'
import DotnetIcon from '~icons/simple-icons/dotnet'
import FirebaseIcon from '~icons/simple-icons/firebase'
import FiverrIcon from '~icons/simple-icons/fiverr'
import GitIcon from '~icons/simple-icons/git'
import GoIcon from '~icons/simple-icons/go'
import KubernetesIcon from '~icons/simple-icons/kubernetes'
import LangchainIcon from '~icons/simple-icons/langchain'
import LinuxIcon from '~icons/simple-icons/linux'
import MicrosoftsqlserverIcon from '~icons/simple-icons/microsoftsqlserver'
import NestjsIcon from '~icons/simple-icons/nestjs'
import NextdotjsIcon from '~icons/simple-icons/nextdotjs'
import NodedotjsIcon from '~icons/simple-icons/nodedotjs'
import OpenaiIcon from '~icons/simple-icons/openai'
import OpensourceinitiativeIcon from '~icons/simple-icons/opensourceinitiative'
import PackerIcon from '~icons/simple-icons/packer'
import PostgresqlIcon from '~icons/simple-icons/postgresql'
import PrismaIcon from '~icons/simple-icons/prisma'
import PythonIcon from '~icons/simple-icons/python'
import PytorchIcon from '~icons/simple-icons/pytorch'
import ReactIcon from '~icons/simple-icons/react'
import RedisIcon from '~icons/simple-icons/redis'
import TailwindcssIcon from '~icons/simple-icons/tailwindcss'
import TerraformIcon from '~icons/simple-icons/terraform'
import TypescriptIcon from '~icons/simple-icons/typescript'
import { companies } from '../../data/portfolio'

/**
 * Ported 1:1 from src-astro/components/Experience.astro (registered under
 * the `experience` command). `class` prop and inner `command-output` div
 * dropped for the same reason noted in About.tsx. The `companies` data
 * array is byte-identical to the one inlined in the Astro source, and is
 * already exposed from `../../data/portfolio` (added for the resume
 * generator), so it's imported from there instead of duplicated — unlike
 * Education.tsx/Certifications.tsx, whose Astro-source data had already
 * drifted from that shared file. astro-icon's dynamic `<Icon name={...} />`
 * becomes a lookup into `ICONS`, a map of statically-imported
 * unplugin-icons components keyed by the same `"collection:name"` string
 * the Astro source used (see Skills.tsx for the same pattern).
 */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  'lucide:building': LucideBuildingIcon,
  'lucide:building-2': LucideBuilding2Icon,
  'lucide:code-2': LucideCode2Icon,
  'lucide:cpu': LucideCpuIcon,
  'lucide:crosshair': LucideCrosshairIcon,
  'lucide:gamepad-2': LucideGamepad2Icon,
  'lucide:layers': LucideLayersIcon,
  'lucide:palette': LucidePaletteIcon,
  'lucide:share-2': LucideShare2Icon,
  'lucide:shield-check': LucideShieldCheckIcon,
  'mdi:microsoft-azure': MdiMicrosoftAzureIcon,
  'simple-icons:adobeaftereffects': AdobeaftereffectsIcon,
  'simple-icons:adobepremierepro': AdobepremiereproIcon,
  'simple-icons:amazonaws': AmazonawsIcon,
  'simple-icons:azuredevops': AzuredevopsIcon,
  'simple-icons:cloudflare': CloudflareIcon,
  'simple-icons:csharp': CsharpIcon,
  'simple-icons:docker': DockerIcon,
  'simple-icons:dotnet': DotnetIcon,
  'simple-icons:firebase': FirebaseIcon,
  'simple-icons:fiverr': FiverrIcon,
  'simple-icons:git': GitIcon,
  'simple-icons:go': GoIcon,
  'simple-icons:kubernetes': KubernetesIcon,
  'simple-icons:langchain': LangchainIcon,
  'simple-icons:linux': LinuxIcon,
  'simple-icons:microsoftsqlserver': MicrosoftsqlserverIcon,
  'simple-icons:nestjs': NestjsIcon,
  'simple-icons:nextdotjs': NextdotjsIcon,
  'simple-icons:nodedotjs': NodedotjsIcon,
  'simple-icons:openai': OpenaiIcon,
  'simple-icons:opensourceinitiative': OpensourceinitiativeIcon,
  'simple-icons:packer': PackerIcon,
  'simple-icons:postgresql': PostgresqlIcon,
  'simple-icons:prisma': PrismaIcon,
  'simple-icons:python': PythonIcon,
  'simple-icons:pytorch': PytorchIcon,
  'simple-icons:react': ReactIcon,
  'simple-icons:redis': RedisIcon,
  'simple-icons:tailwindcss': TailwindcssIcon,
  'simple-icons:terraform': TerraformIcon,
  'simple-icons:typescript': TypescriptIcon,
}

export function Experience() {
  return (
    <section>
      <div className="text-[#bb9af7] font-bold mb-2">Experience History</div>
      <div className="space-y-6">
        {companies.map((company, companyIndex) => {
          const CompanyIcon = ICONS[company.icon]
          return (
            <div className="company-group" key={company.company}>
              {/* Company header */}
              <div className="flex items-center gap-2">
                <span className="text-[#a9b1d6]">
                  {companyIndex === companies.length - 1 ? '└─▶' : '├─▶'}
                </span>
                <CompanyIcon className="w-4 h-4 text-[#7aa2f7]" />
                <span className="text-[#7aa2f7] font-bold">{company.company}</span>
                <span className="text-[#a9b1d6] text-xs">·</span>
                <span className="text-[#a9b1d6] text-xs">{company.totalPeriod}</span>
              </div>

              {/* Roles under this company */}
              <div className="ml-6 mt-2 space-y-4 border-l border-[#a9b1d6]/30 pl-4">
                {company.roles.map((role, roleIndex) => (
                  <div className="role-entry" key={role.title}>
                    <div className="flex items-center gap-2">
                      <span className="text-[#a9b1d6]">
                        {roleIndex === company.roles.length - 1 ? '└─' : '├─'}
                      </span>
                      <span className={role.typeColor + ' text-xs font-mono'}>[{role.type}]</span>
                      <span className="text-[#9ece6a] font-semibold">{role.title}</span>
                    </div>
                    <div className="ml-6 mt-0.5 text-[#a9b1d6] text-xs">{role.period}</div>
                    <div className="ml-6 mt-2 space-y-1">
                      {role.responsibilities.map((resp) => (
                        <div className="flex items-start gap-2" key={resp}>
                          <span className="text-[#a9b1d6] mt-0.5">│</span>
                          <span className="text-[#c0caf5] text-sm">{resp}</span>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2 mt-2 pl-3 border-l border-[#a9b1d6]/20">
                        {role.tech.map((t) => {
                          const TechIcon = ICONS[t.icon]
                          return (
                            <div
                              className="flex items-center gap-1 bg-[#1a1b26] border border-[#a9b1d6]/40 rounded px-1.5 py-0.5"
                              key={t.name}
                            >
                              <TechIcon className="w-3 h-3 text-[#7aa2f7]" />
                              <span className="text-[#9ece6a] text-[10px]">{t.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
