import * as semver from "semver";
import { Context } from "../types";

export async function nextRelease(ctx: Context, tagPrefix?: string, defaultVersion?: string) {
  if (ctx.bump == null) {
    throw new Error("No recomended version bump, aborting!");
  }

  if (ctx.lastRelease.gitTag) {
    const lastVersion = ctx.lastRelease.version;
    let version: string;

    if (ctx.preReleaseTag != null) {
      const lastVersionPreArray = semver.prerelease(lastVersion);
      const lastVersionPre = Array.isArray(lastVersionPreArray) ? lastVersionPreArray[0] : null;

      if (lastVersionPre === ctx.preReleaseTag) {
        version = semver.inc(lastVersion, "prerelease");
      } else {
        version = semver.inc(lastVersion, "pre" + ctx.bump, ctx.preReleaseTag);
      }
    } else {
      version = semver.inc(lastVersion, ctx.bump);
    }

    ctx.nextRelease = {
      version,
      gitTag: (tagPrefix || ctx.config.tagPrefix) + version,
    };

    return;
  }

  const coerced = semver.coerce(defaultVersion || ctx.rootVersion);
  const version = ctx.preReleaseTag != null ? `${coerced?.version}-${ctx.preReleaseTag}.0` : coerced?.version;

  ctx.nextRelease = {
    version,
    gitTag: (tagPrefix || ctx.config.tagPrefix) + version,
  };

  ctx.logger.warn(
    `No previous release found. Next release will default to your package.json version ${ctx.nextRelease.version}`
  );
}
