import { Context, NamedVersion } from "../types";

const versions: NamedVersion[] = ["major", "minor", "patch"];

export async function getVersionBump(ctx: Context) {
  // start out of the array is intended
  let bump = 3;

  for (const commit of ctx.commits) {
    if (commit.notes.length > 0) {
      const isBreaking = commit.notes.find((note) => note.title === ctx.config.breakingKeyWord);

      if (isBreaking) {
        bump = 0;
        break;
      }
    }

    if (commit.type === "feat") {
      bump = 1;
    } else if (bump > 2 && (commit.type === "fix" || commit.type === "perf")) {
      bump = 2;
    }
  }

  // returns undefined if out of the array
  // which means no relevant type was found
  ctx.bump = versions[bump];
}
