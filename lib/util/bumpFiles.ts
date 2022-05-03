import { Context } from "../types";

import * as fse from "fs-extra";
import * as path from "path";
import { JSONFileData } from "./JSONFileData";

import { BumpFilesFunc } from "../types";

async function bumpPackage(version: string, folderPath = "") {
  const pkg = await JSONFileData(path.resolve(folderPath, "package.json"));

  pkg.version = version;

  return fse.writeFile(path.resolve(folderPath, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
}

export async function bumpFiles(ctx: Context, folderPath = "") {
  const bumps = [bumpPackage(ctx.nextRelease.version, folderPath)];

  if (ctx.config.bumpFilesFunc) {
    const bumpFilesFunc: BumpFilesFunc = require(path.resolve(process.cwd(), ctx.config.bumpFilesFunc));

    bumps.push(bumpFilesFunc({ version: ctx.nextRelease.version, folderPath }));
  }

  return Promise.all(bumps);
}
