import { describe, it, expect } from 'vitest'
import { COMMANDS, COMMAND_NAMES, executeLine } from '../commands'

const noCtx = { awaitingProjectResponse: false }

describe('registry', () => {
  it('contains all 25 commands', () => {
    expect(COMMAND_NAMES.sort()).toEqual([
      'about','certifications','clear','contact','education','experience','github','hack',
      'help','ls','matrix','nano','neofetch','ping','projects','resume','rm','skills',
      'sudo','time','vi','vim','weather','welcome','whoami',
    ].sort())
  })
  it('every command has a description', () =>
    COMMANDS.forEach(c => expect(c.description.length).toBeGreaterThan(0)))
})

describe('executeLine', () => {
  it('clear → action', () => expect(executeLine('clear', noCtx).action).toBe('clear'))
  it('sudo → Santa joke', () =>
    expect(executeLine('sudo', noCtx).text!.lines[0]).toContain('Santa Claus'))
  it('rm -rf / → protected', () =>
    expect(executeLine('rm -rf /', noCtx).text!.lines[0]).toContain("can't let you delete"))
  it('projects sets follow-up flag', () =>
    expect(executeLine('projects', noCtx).awaitProjectResponse).toBe(true))
  it('y answers follow-up', () => {
    const r = executeLine('y', { awaitingProjectResponse: true })
    expect(r.text!.lines.join(' ')).toContain('GitHub')
  })
  it('bad follow-up keeps flag', () =>
    expect(executeLine('maybe', { awaitingProjectResponse: true }).awaitProjectResponse).toBe(true))
  it('unknown command suggests', () => {
    const r = executeLine('hepl', noCtx)
    expect(r.text!.lines[0]).toContain('Command not found')
    expect(r.text!.lines[1]).toContain("help")
  })
  it('section command renders component', () =>
    expect(executeLine('about', noCtx)).toMatchObject({ kind: 'component', componentName: 'about' }))
})
