import * as gitUrlParse from 'git-url-parse'
import { Context } from '../types'
import { bumpFiles } from '../util/bumpFiles'
import { commit, pushWithTags, tag } from '../util/git'
import { writeNotes } from './writeNotes'
import { writeChangelog } from './writeChangelog'

export async function createReleaseNotes(ctx: Context, folderPath?: string) {
  if (ctx.nextRelease.version == null) {
    throw new Error('No next release version, can\'t make release notes, aborting!')
  }

  ctx.config.debug && ctx.logger.info('Writing notes')
  await writeNotes(ctx)

  ctx.config.debug && ctx.logger.info('Writing changelog and bumping version files')
  await writeChangelog(ctx, folderPath)
  await bumpFiles(ctx, folderPath)

  ctx.logger.success(`Changelog and versioning done for: ${ctx.nextRelease.gitTag}`)

  if (!ctx.config.dryRun) {
    ctx.config.debug && ctx.logger.info(`Commit and tag for: ${ctx.nextRelease.gitTag}`)
    await commit(ctx.config.releaseMessage.replace('%s', ctx.nextRelease.gitTag))
    await tag(ctx.nextRelease.gitTag)
    await pushWithTags()

    const { owner, name } = gitUrlParse(ctx.config.repository)

    const result = await ctx.githubApi.repos.createRelease({
      owner: owner,
      repo: name,
      tag_name: ctx.nextRelease.gitTag,
      name: ctx.nextRelease.gitTag,
      body: ctx.notes,
      draft: false,
      prerelease: !!ctx.preReleaseTag,
    }).catch((err) => {
      throw new Error(`create github release fails with: ${err.message}`)
    })

    if (result.status >= 400) {
      ctx.logger.error(`create github release fails with status code: ${result.status}`)
    }

    ctx.logger.success(`Release created for: ${ctx.nextRelease.gitTag}`)
  }
}
