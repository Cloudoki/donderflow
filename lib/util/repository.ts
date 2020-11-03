import { isObj } from '../util/isObj'
import { Context, PkgRepoObject } from '../types'

export function repository(ctx: Context, pkgRepoData: PkgRepoObject | string) {
  if (ctx.config.repository) {
    ctx.config.repository = ctx.config.repository.replace(/\.git$/, '')
  } else if (isObj(pkgRepoData)) {
    if (typeof (pkgRepoData as PkgRepoObject).url !== 'string') {
      throw new Error('package.json repository url must be a string.')
    }

    ctx.config.repository = (pkgRepoData as PkgRepoObject).url.replace(/\.git$/, '')
  } else if (typeof pkgRepoData === 'string') {
    ctx.config.repository = pkgRepoData.replace(/\.git$/, '')
  } else {
    throw new Error('package.json repository not found.')
  }
}
