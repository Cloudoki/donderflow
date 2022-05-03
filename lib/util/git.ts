import * as execa from "execa";
import * as semver from "semver";
import { TagInfo } from "../types";

export async function gitTags(tagPrefix: string): Promise<TagInfo[]> {
  return (await execa.stdout("git", ["tag", "-l"]))
    .split("\n")
    .filter((tag: string) => tag.startsWith(tagPrefix) && semver.valid(tag.replace(tagPrefix, "")))
    .map((gitTag: string) => ({ version: gitTag.replace(tagPrefix, ""), gitTag }))
    .sort((a: TagInfo, b: TagInfo) => semver.rcompare(a.version, b.version));
}

export async function gitTagHead(tagName: string) {
  return execa.stdout("git", ["rev-list", "-1", tagName]);
}

export async function tag(tagName: string) {
  return execa("git", ["tag", "-a", tagName, "-m", tagName]);
}

export async function pushWithTags() {
  return execa("git", ["push", "--follow-tags"]);
}

export async function commit(message: string) {
  await execa("git", ["add", "--all"]);
  await execa("git", [
    "commit",
    // TODO: using cloudoki deploy info for commits atm - revise this
    '--author="cloudoki-deploy <general@cloudoki.com>"',
    "-m",
    message,
  ]);
}

export async function currentBranchName() {
  return execa.stdout("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
}

export async function status() {
  return execa.stdout("git", ["status"]);
}
