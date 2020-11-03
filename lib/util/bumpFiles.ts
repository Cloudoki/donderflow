import { Context } from '../types'

import * as fse from 'fs-extra'
import * as path from 'path'
import { JSONFileData } from './JSONFileData'

async function bumpPackage(version: string, folderPath = '') {
  const pkg = await JSONFileData(path.resolve(folderPath, 'package.json'))

  pkg.version = version

  return fse.writeFile(path.resolve(folderPath, 'package.json'), JSON.stringify(pkg, null, 2))
}

export async function bumpFiles(ctx: Context, folderPath = '') {
  return bumpPackage(ctx.nextRelease.version, folderPath)
}
