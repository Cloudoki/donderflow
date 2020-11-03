import { Signale } from 'signale'
import { Octokit } from '@octokit/rest'

export type PkgRepoObject = { url: string }

export type ArgFlag =
'debug'
| 'dry-run'
| 'preid'
| 'select-packages'

export type NamedVersion = 'major' | 'minor' | 'patch'

export type CommitReferenceAction =
'close'
| 'closes'
| 'closed'
| 'fix'
| 'fixes'
| 'fixed'
| 'resolve'
| 'resolves'
| 'resolved'

export type CommitReference = {
  action: CommitReferenceAction,
  owner: string | null,
  repository: string | null,
  issue: string,
  raw: string,
  prefix: string,
}

export type Commit = {
  type: string | null,
  scope: string | null,
  subject: string | null,
  merge: string | null,
  header: string | null,
  body: string | null,
  footer: string | null,
  notes: {
    title: string,
    text: string,
  }[],
  references: CommitReference[],
  mentions: string[],
  revert: {
    header: string,
    hash: string,
  } | null,
  commit: {
    long: string,
    short: string,
  },
  committer: {
    name: string,
    email: string,
    date: string,
  },
}

export type packageInfo = { folderPath: string; pkgName: string; pkgVersion: string }

export interface Context {
  config: {
    github: {
      apiUrl: string,
      apiPathPrefix: string,
    },
    allowBranch: string[],
    packages: string[],
    releaseMessage: string,
    tagPrefix: string,
    changelogPath: string,
    changelogTitle: string,
    breakingKeyWord: string,
    repository?: string,
    debug?: boolean,
    dryRun?: boolean,
  },
  rootName: string,
  rootVersion: string,
  packages: packageInfo[],
  preReleaseTag: string | null,
  lastRelease: {
    head?: string,
    version?: string,
    gitTag?: string,
  },
  nextRelease: {
    version?: string,
    gitTag?: string,
  },
  bump?: NamedVersion,
  commits: Commit[],
  notes?: string,
  logger: Signale,
  hasFlag: (flag: ArgFlag) => boolean,
  flagValues: (flag: ArgFlag) => string[],
  githubApi: Octokit,
}

export type WriteRefs = Record<CommitReferenceAction, CommitReference>

export type TagInfo = { version: string; gitTag: string }
