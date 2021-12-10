import * as dotenv from 'dotenv'
import { initializeContext } from './initializeContext'
import { latestRelease } from './util/latestRelease'
import { getCommits } from './util/getCommits'
import { getVersionBump } from './util/getVersionBump'
import { nextRelease } from './util/nextRelease'
import { createReleaseNotes } from './notes'
import { status } from './util/git'

// load process.env variables
dotenv.config()

module.exports = async function main(args: string[]) {
  const ctx = await initializeContext(args)

  try {
    const cleanWorkingTree = (await status()).includes('nothing to commit, working tree clean')
    if (!cleanWorkingTree) {
      throw new Error('Working tree not clean - please commit your work before using donderflow.')
    }

    if (ctx.packages.length > 0) {
      for (const info of ctx.packages) {
        ctx.logger.info(`package: ${info.pkgName}`)

        const tagPrefix = `${info.pkgName}@`

        await latestRelease(ctx, tagPrefix)
        await getCommits(ctx, info.folderPath)
        await getVersionBump(ctx)

        if (ctx.bump != null) {
          await nextRelease(ctx, tagPrefix, info.pkgVersion)
          await createReleaseNotes(ctx, info.folderPath)
        } else {
          ctx.logger.info('No recommended version bump, skipped.')
        }

        // space logs
        console.log('\n')
      }
    } else {
      await latestRelease(ctx)
      await getCommits(ctx)
      await getVersionBump(ctx)
      await nextRelease(ctx)
      await createReleaseNotes(ctx)
    }

    ctx.logger.success('done')
  } catch (error) {
    ctx.logger.error(error.message || error)

    throw error
  }
}
