import * as semver from 'semver'
import { gitTags, gitTagHead } from './git'
import { Context, TagInfo } from '../types'

export async function latestRelease(ctx: Context, tagPrefix?: string) {
  const tags = await gitTags(tagPrefix || ctx.config.tagPrefix)

  let tag: TagInfo

  // look for the last prerelease with same preid - default to last release
  for (const foundTag of tags) {
    const preidInfo = semver.prerelease(foundTag.version)

    if (ctx.preReleaseTag) {
      // whe only care for the last prerelease with the same preidInfo as the current one
      if (ctx.preReleaseTag === preidInfo[0]) {
        tag = foundTag
        break
      }
    }

    // default to last release
    if (!preidInfo) {
      tag = foundTag
      break
    }
  }

  if (tag) {
    ctx.config.debug && ctx.logger.info('Last version found %s', tag.version)

    ctx.lastRelease = { head: await gitTagHead(tag.gitTag), ...tag }
  } else if (ctx.config.debug) {
    ctx.logger.info('No last version found')
  }
}
