/**
 * Terminal command registry and dispatcher.
 *
 * Reproduces the command handling in src-astro/pages/index.astro
 * (help list: lines 257-348; ls entries: lines 99-162; dispatch logic:
 * lines 739-880) as pure, testable data + a pure `executeLine` function.
 *
 * `Output` components are wired up in Tasks 8-10; until then every
 * `kind: 'output'` command points at a shared `Placeholder`.
 */
import type { ComponentType } from 'react'
import { suggestClosest } from './input-helpers'
import { Welcome } from '../components/outputs/Welcome'
import { Whoami } from '../components/outputs/Whoami'
import { About } from '../components/outputs/About'
import { Contact } from '../components/outputs/Contact'
import { Education } from '../components/outputs/Education'
import { Certifications } from '../components/outputs/Certifications'
import { TimeOutput } from '../components/outputs/TimeOutput'
import { Weather } from '../components/outputs/Weather'
import { Ping } from '../components/outputs/Ping'
import { Skills } from '../components/outputs/Skills'
import { Experience } from '../components/outputs/Experience'
import { Projects } from '../components/outputs/Projects'
import { Ls } from '../components/outputs/Ls'
import { Help } from '../components/outputs/Help'
import { Neofetch } from '../components/outputs/Neofetch'

export interface CommandDef {
  name: string
  description: string // shown by help
  lsEntry?: { name: string; perms: string; note: string } // shown by ls (only section cmds + files)
  kind: 'output' | 'action'
  Output?: ComponentType // for kind 'output' (wired in Tasks 8-10; placeholder until then)
  action?: 'clear' | 'matrix' | 'hack' | 'open-resume'
  /**
   * True for the easter-egg commands (resume, sudo, rm, vi, vim, nano) that
   * are valid input but intentionally excluded from the `help` listing
   * (src-astro/pages/index.astro:257-348 never mentions them, though
   * `executeLine`, in the same file at lines 749-775, still handles them).
   * `Help` and `Ls` both derive their rendered rows from this registry
   * (single source of truth): `Help` filters on `!hidden`, `Ls` filters on
   * `lsEntry` presence — `resume` has an `lsEntry` (it shows up as
   * `resume.pdf`) despite being `hidden` from `help`.
   */
  hidden?: boolean
}

/** Temporary stand-in for the section components not yet ported (Tasks 9-10). */
const Placeholder: ComponentType = () => <div>…</div>

export const COMMANDS: CommandDef[] = [
  // Canonical order matches the AVAILABLE COMMANDS list in
  // src-astro/pages/index.astro:257-348.
  {
    name: 'ls',
    description: 'List available sections and commands',
    kind: 'output',
    Output: Ls,
  },
  {
    name: 'welcome',
    description: 'Display welcome message and ASCII art',
    lsEntry: { name: 'welcome.txt', perms: '-rw-r--r--', note: 'welcome message' },
    kind: 'output',
    Output: Welcome,
  },
  {
    name: 'whoami',
    description: 'Show detailed profile information',
    lsEntry: { name: 'whoami.txt', perms: '-rw-r--r--', note: 'profile info' },
    kind: 'output',
    Output: Whoami,
  },
  {
    name: 'about',
    description: 'View my professional summary',
    lsEntry: { name: 'about/', perms: 'drwxr-xr-x', note: 'professional summary' },
    kind: 'output',
    Output: About,
  },
  {
    name: 'projects',
    description: 'Browse my featured projects',
    lsEntry: { name: 'projects/', perms: 'drwxr-xr-x', note: 'featured work' },
    kind: 'output',
    Output: Projects,
  },
  {
    name: 'skills',
    description: 'List technical skills and expertise',
    lsEntry: { name: 'skills/', perms: 'drwxr-xr-x', note: 'technical expertise' },
    kind: 'output',
    Output: Skills,
  },
  {
    name: 'experience',
    description: 'View work history and roles',
    lsEntry: { name: 'experience/', perms: 'drwxr-xr-x', note: 'work history' },
    kind: 'output',
    Output: Experience,
  },
  {
    name: 'education',
    description: 'View academic background',
    lsEntry: { name: 'education/', perms: 'drwxr-xr-x', note: 'academic background' },
    kind: 'output',
    Output: Education,
  },
  {
    name: 'certifications',
    description: 'View professional certificates',
    lsEntry: { name: 'certifications/', perms: 'drwxr-xr-x', note: 'licenses & certs' },
    kind: 'output',
    Output: Certifications,
  },
  {
    name: 'contact',
    description: 'Get my contact information',
    lsEntry: { name: 'contact/', perms: 'drwxr-xr-x', note: 'social links' },
    kind: 'output',
    Output: Contact,
  },
  {
    name: 'clear',
    description: 'Clear terminal screen',
    kind: 'action',
    action: 'clear',
  },
  {
    name: 'help',
    description: 'Show this help message',
    kind: 'output',
    Output: Help,
  },
  {
    name: 'neofetch',
    description: 'Display system information',
    kind: 'output',
    Output: Neofetch,
  },
  {
    name: 'time',
    description: 'Show current time',
    kind: 'output',
    Output: TimeOutput,
  },
  {
    name: 'weather',
    description: 'Check the weather (sort of)',
    kind: 'output',
    Output: Weather,
  },
  {
    name: 'matrix',
    description: 'Full-screen matrix rain simulation',
    kind: 'action',
    action: 'matrix',
  },
  {
    name: 'hack',
    description: 'Initiate a totally real hacking sequence 😈',
    kind: 'action',
    action: 'hack',
  },
  {
    name: 'ping',
    description: 'Test connection to dfanso.dev',
    kind: 'output',
    Output: Ping,
  },
  {
    name: 'github',
    description: 'Show GitHub stats and contributions',
    lsEntry: { name: 'github/', perms: 'drwxr-xr-x', note: 'stats & contributions' },
    kind: 'output',
    Output: Placeholder,
  },
  // Hidden/easter-egg commands: not part of the help list, but still valid
  // input handled by executeLine (index.astro:749-775) and offered for
  // tab-completion / "did you mean" suggestions.
  {
    name: 'resume',
    description: 'Open the resume PDF',
    lsEntry: { name: 'resume.pdf', perms: '-rw-r--r--', note: 'curriculum vitae' },
    kind: 'action',
    action: 'open-resume',
    hidden: true,
  },
  {
    name: 'sudo',
    description: 'Attempt to gain superuser privileges',
    kind: 'action',
    hidden: true,
  },
  {
    name: 'rm',
    description: 'Remove files (nice try)',
    kind: 'action',
    hidden: true,
  },
  {
    name: 'vi',
    description: 'Open the vi text editor',
    kind: 'action',
    hidden: true,
  },
  {
    name: 'vim',
    description: 'Open the vim text editor',
    kind: 'action',
    hidden: true,
  },
  {
    name: 'nano',
    description: 'Open the nano text editor',
    kind: 'action',
    hidden: true,
  },
]

export const COMMAND_NAMES: string[] = COMMANDS.map((c) => c.name)

export function findCommand(name: string): CommandDef | undefined {
  const lower = name.toLowerCase()
  return COMMANDS.find((c) => c.name === lower)
}

export interface Execution {
  // what the reducer stores per submitted line
  kind: 'component' | 'text' | 'action'
  componentName?: string // key into COMMANDS for kind 'component'
  text?: { color: string; lines: string[] } // for joke/text outputs
  action?: 'clear' | 'matrix' | 'hack' | 'open-resume'
  awaitProjectResponse?: boolean // set by 'projects'
}

/** The 7 emoji "nudge" messages for empty input (index.astro:707-715). */
const EMPTY_INPUT_MESSAGES = [
  '🤔 Hmm... trying to say something?',
  '💭 The silence is deafening...',
  '⌨️ The keyboard is waiting for your command!',
  "✨ Type 'help' if you're not sure what to do",
  '🌟 Press some keys, then press Enter!',
  '🎯 Almost there! Just need to type a command first',
  '🚀 Ready for your input, commander!',
]

export function executeLine(
  raw: string,
  ctx: { awaitingProjectResponse: boolean; rand?: number },
): Execution {
  const command = raw.trim().toLowerCase()

  if (!command) {
    const message = EMPTY_INPUT_MESSAGES[Math.floor((ctx.rand ?? 0) * EMPTY_INPUT_MESSAGES.length)]
    return { kind: 'text', text: { color: 'text-[#bb9af7]', lines: [message] } }
  }

  const args = command.split(' ')
  const cmd = args[0]

  if (cmd === 'clear') {
    return { kind: 'action', action: 'clear' }
  }

  if (cmd === 'resume') {
    return {
      kind: 'action',
      action: 'open-resume',
      text: { color: 'text-[#c0caf5]', lines: ['Opening resume...'] },
    }
  }

  if (command === 'sudo') {
    return {
      kind: 'text',
      text: {
        color: 'text-[#f7768e]',
        lines: [
          'Permission denied: You are not in the sudoers file. This incident will be reported to Santa Claus. 🎅',
        ],
      },
    }
  }

  if (command.startsWith('rm')) {
    if (command.includes('-rf') && (command.includes('/') || command.includes('*'))) {
      return {
        kind: 'text',
        text: {
          color: 'text-[#f7768e]',
          lines: ["⚠️ CRITICAL ERROR: Nice try! But I can't let you delete my portfolio."],
        },
      }
    }
    return {
      kind: 'text',
      text: { color: 'text-[#f7768e]', lines: ['rm: missing operand'] },
    }
  }

  if (['vi', 'vim', 'nano'].includes(command)) {
    return {
      kind: 'text',
      text: {
        color: 'text-[#e0af68]',
        lines: ["Error: Text editor functionality not implemented yet. Try 'code .' instead? 😉"],
      },
    }
  }

  if (ctx.awaitingProjectResponse) {
    const response = command
    if (response === 'y' || response === 'yes') {
      return {
        kind: 'text',
        text: {
          color: 'text-[#9ece6a]',
          lines: ['🔗 Check out more of my projects:', '└─▶ Visit my GitHub Profile'],
        },
      }
    }
    if (response === 'n' || response === 'no') {
      return {
        kind: 'text',
        text: {
          color: 'text-[#9ece6a]',
          lines: ["└─▶ Alright! Feel free to explore other commands using `help`."],
        },
      }
    }
    return {
      kind: 'text',
      text: { color: 'text-[#f7768e]', lines: ['└─▶ Please answer with y/n.'] },
      awaitProjectResponse: true,
    }
  }

  if (cmd === 'matrix') {
    return {
      kind: 'action',
      action: 'matrix',
      text: {
        color: 'text-[#9ece6a]',
        lines: ['Launching matrix simulation... (press ESC or click anywhere to exit)'],
      },
    }
  }

  if (cmd === 'hack') {
    return {
      kind: 'action',
      action: 'hack',
      text: {
        color: 'text-[#f7768e]',
        lines: ['Initiating hack sequence... (stand by)'],
      },
    }
  }

  const found = findCommand(command)
  if (found) {
    const execution: Execution = { kind: 'component', componentName: found.name }
    if (found.name === 'projects') {
      execution.awaitProjectResponse = true
    }
    return execution
  }

  const suggestion = suggestClosest(command, COMMAND_NAMES)
  const lines = [`└─▶ Command not found: ${command}`]
  if (suggestion) {
    lines.push(`Did you mean '${suggestion}'?`)
  }
  return { kind: 'text', text: { color: 'text-[#f7768e]', lines } }
}
