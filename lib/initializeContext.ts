import * as path from 'path'
import logger from './util/logger'
import { createGithubClient } from './util/createGithubClient'
import { currentBranchName } from './util/git'
import { JSONFileData } from './util/JSONFileData'
import { normalizedPackages } from './util/normalizedPackages'
import { repository } from './util/repository'

import { ArgFlag, Context } from './types'

export async function initializeContext(args: string[]): Promise<Context> {
  try {
    if (!process.env.GH_TOKEN) {
      throw new Error('GH_TOKEN environment variable is required.')
    }

    const [pkgData, defaults, userDefaults] = await Promise.all([
      JSONFileData('package.json'),
      JSONFileData(path.resolve(__dirname, 'defaults.json')),
      JSONFileData('donderflow.json'),
    ])

    const hasFlag = (flag: ArgFlag) => args.some((value) => value.startsWith(`--${flag}`))

    const flagValues = (flag: ArgFlag) => {
      const values: string[] = []

      let flagFound = false
      for (const arg of args) {
        if (flagFound) {
          if (arg.startsWith('--')) break

          values.push(arg)
          continue
        }

        flagFound = arg === `--${flag}`
      }

      return values
    }

    const ctx: Context = {
      config: {
        debug: hasFlag('debug'),
        dryRun: hasFlag('dry-run'),
        ...defaults,
        ...userDefaults,
      },
      rootName: pkgData.name,
      rootVersion: pkgData.version,
      packages: [],
      preReleaseTag: flagValues('preid')[0] || null,
      lastRelease: {},
      nextRelease: {},
      commits: [],
      logger,
      hasFlag,
      flagValues,
      githubApi: createGithubClient(process.env.GH_TOKEN),
    }

    repository(ctx, pkgData.repository)

    const branchName = await currentBranchName()

    if (!ctx.config.allowBranch.includes(branchName)) {
      throw new Error(`${branchName} is not allowed to run donderflow - see allowBranch in donderflow.json`)
    }

    if (ctx.config.packages.length > 0) {
      ctx.config.packages = await normalizedPackages(ctx.config.packages)

      const selectPackages = flagValues('select-packages')

      // filter packages in cli
      if (selectPackages.length > 0) {
        const filteredPackages = []

        // ex: --select-packages pkg-1 pkg-2 will map to [ folderName/pkg-1, folderName/pkg-2 ]
        for (const name of selectPackages) {
          const fullPath = ctx.config.packages.find((path) => path.endsWith(name))

          if (fullPath) {
            filteredPackages.push(fullPath)
          }
        }

        ctx.config.packages = filteredPackages
      }

      for (const folderPath of ctx.config.packages) {
        const pkgInfo = await JSONFileData(path.resolve(folderPath, 'package.json'))
        ctx.packages.push({
          folderPath,
          pkgName: pkgInfo.name,
          pkgVersion: pkgInfo.version,
        })
      }
    }

    return ctx
  }
  catch (error) {
    logger.error(error.message || error)

    throw error
  }
}
