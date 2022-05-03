import * as fse from "fs-extra";

export async function JSONFileData(filePath: string) {
  try {
    const file = await fse.readFile(filePath, { encoding: "utf8" });
    return JSON.parse(file);
  } catch (e) {
    return {};
  }
}
