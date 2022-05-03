import * as execa from "execa";

const wildcard = "/*";

export async function normalizedPackages(packages: string[]) {
  let paths = [];

  for (const pkg of packages) {
    const wildcrdIndex = pkg.lastIndexOf(wildcard);

    if (wildcrdIndex > -1) {
      const folder = pkg.replace(wildcard, "");
      const out = await execa.stdout("ls", [folder]);
      const fullPaths = out.split("\n").map((path: string) => `${folder}/${path}`);

      paths = paths.concat(fullPaths);

      continue;
    }

    paths.push(pkg);
  }

  return [...new Set<string>(paths)];
}
