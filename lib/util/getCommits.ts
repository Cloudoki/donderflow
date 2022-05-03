import * as gitLogParser from "git-log-parser";
import * as getStream from "get-stream";
import * as commitsFilter from "conventional-commits-filter";
import * as conventionalCommitsParser from "conventional-commits-parser";

import { Context } from "../types";

export async function getCommits(ctx: Context, folderPath?: string) {
  const gitHead = ctx.lastRelease.head;

  if (ctx.config.debug) {
    const log = gitHead ? ["Use gitHead: %s", gitHead] : ["No previous release found, retrieving all commits"];
    ctx.logger.info(...log);
  }

  // add rawBody property to be parsed later by conventional-commits-filter
  Object.assign(gitLogParser.fields, { rawBody: "B" });

  let opts = [];

  if (folderPath) {
    opts = ["--", folderPath];
  }

  const commits = await getStream.array(
    gitLogParser.parse({
      _: [`${gitHead ? gitHead + ".." : ""}HEAD`, ...opts],
    })
  );

  ctx.commits = commitsFilter(
    commits.map((rawCommit) => ({
      ...conventionalCommitsParser.sync(rawCommit.rawBody),
      commit: rawCommit.commit,
      committer: rawCommit.committer,
    }))
  );

  ctx.config.debug && ctx.logger.info(`Found ${ctx.commits.length} commits since last release`);
}
