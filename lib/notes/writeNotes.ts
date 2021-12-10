import * as dateFormat from 'dateformat'
import { WriteRefs, Context } from '../types'

function writeHead(ctx: Context) {
  const prevTag = ctx.lastRelease.gitTag
  const nextTag = ctx.nextRelease.gitTag

  if (prevTag != null) {
    return `<a name="${nextTag}"></a>
## [${nextTag}](${ctx.config.repository.raw}/compare/${prevTag}...${nextTag})
###### *${dateFormat(new Date(), 'mmm d, yyyy')}*`
  }

  return `<a name="${nextTag}"></a>
## ${nextTag}
###### *${dateFormat(new Date(), 'mmm d, yyyy')}*`
}

function writeTitle(title: string) {
  return `

### ${title}
`
}

function writeScope(scope: string) {
  return `
* **${scope}:**`
}

function writeLine(ctx: Context, nested: boolean, text: string, hash?: string, refs?: WriteRefs) {
  const hashStr = hash ? ` ([${hash}](${ctx.config.repository.raw}/commit/${hash}))` : ''
  let refsStr = ''

  if (refs) {
    refsStr = ', '

    Object.keys(refs).forEach((actionKey, indx) => {
      const action = refs[actionKey]

      if (!action.length) return

      if (indx > 0) {
        refsStr += ', '
      }

      refsStr += `${actionKey}`

      action.forEach((issue) => {
        refsStr += ` [${issue.prefix + issue.issue}](${ctx.config.repository.raw}/issues/${issue.issue})`
      })
    })
  }

  return nested
    ? `
  * ${text}${hashStr}${refsStr}`
    : ` ${text}${hashStr}${refsStr}`
}

export async function writeNotes(ctx: Context) {
  const other = 'other'
  const sections = {
    perf: {},
    fix: {},
    feat: {},
    breaking: [],
  }

  ctx.commits.reverse().forEach((commit) => {
    const section = commit.type || other
    const scope = commit.scope || other

    if (!sections.hasOwnProperty(section)) {
      sections[section] = {}
    }

    if (!sections[section].hasOwnProperty(scope)) {
      sections[section][scope] = []
    }

    if (commit.notes.length > 0) {
      commit.notes.forEach((note) => {
        if (note.title === ctx.config.breakingKeyWord) {
          sections.breaking.push(note.text)
        }
      })
    }

    const refs: WriteRefs = {} as any

    if (commit.references.length > 0) {
      commit.references.forEach((ref) => {
        const action = ref.action || other

        if (!refs.hasOwnProperty(action)) {
          refs[action] = []
        }

        refs[action].push(ref)
      })

      delete refs[other]
    }

    sections[section][scope].push({ ...commit, writeRefs: refs })
  })

  let md = writeHead(ctx)

  if (Object.keys(sections.fix).length > 0) {
    md += writeTitle('Bug Fixes')

    const fixes = sections.fix
    Object.keys(fixes).forEach((scope) => {
      const fix = fixes[scope]
      const nested = fix.length > 1

      md += writeScope(scope)

      fix.forEach((commit) => {
        md += writeLine(ctx, nested, commit.subject, commit.commit.short, commit.writeRefs)
      })
    })
  }

  if (Object.keys(sections.feat).length > 0) {
    md += writeTitle('Features')

    const features = sections.feat
    Object.keys(features).forEach((scope) => {
      const feat = features[scope]
      const nested = feat.length > 1

      md += writeScope(scope)

      feat.forEach((commit) => {
        md += writeLine(ctx, nested, commit.subject, commit.commit.short, commit.writeRefs)
      })
    })
  }

  if (Object.keys(sections.perf).length > 0) {
    md += writeTitle('Performance Improvements')

    const perfImprovements = sections.perf
    Object.keys(perfImprovements).forEach((scope) => {
      const perf = perfImprovements[scope]
      const nested = perf.length > 1

      md += writeScope(scope)

      perf.forEach((commit) => {
        md += writeLine(ctx, nested, commit.subject, commit.commit.short, commit.writeRefs)
      })
    })
  }

  if (sections.breaking.length > 0) {
    md += writeTitle('BREAKING CHANGES')

    sections.breaking.forEach((breakText) => {
      md += writeLine(ctx, false, ' * ' + breakText)
    })
  }

  ctx.notes = md
}
