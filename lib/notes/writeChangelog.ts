import * as fse from 'fs-extra'
import * as path from 'path'
import { Context } from '../types'

export async function writeChangelog(ctx: Context, folderPath = '') {
  const changelogPath = path.resolve(folderPath, ctx.config.changelogPath)

  await fse.ensureFile(changelogPath)

  const currentFile = (await fse.readFile(changelogPath)).toString()

  if (currentFile) {
    ctx.config.debug && ctx.logger.info('Update %s', changelogPath)
  } else {
    ctx.config.debug && ctx.logger.info('Create %s', changelogPath)
  }

  const changelogTitle = `# ${ctx.config.changelogTitle}`

  const currentContent = currentFile.startsWith(changelogTitle)
    ? currentFile.slice(changelogTitle.length).trim()
    : currentFile.trim()

  const content = `${ctx.notes.trim()}${currentContent ? `\n\n\n${currentContent}\n` : '\n'}`

  await fse.writeFile(changelogPath, changelogTitle
    ? `${changelogTitle}\n\n${content}` : content)
}
