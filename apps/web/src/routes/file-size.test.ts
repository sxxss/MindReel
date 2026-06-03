import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { describe, expect, test } from "vitest";

const srcDir = join(process.cwd(), "src");

const collectTsx = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectTsx(fullPath);
      }
      return Promise.resolve(entry.name.endsWith(".tsx") ? [fullPath] : []);
    }),
  );
  return files.flat();
};

describe("web file size guard", () => {
  test("keeps TSX files small enough to stay modular", async () => {
    const oversized = [];
    for (const file of await collectTsx(srcDir)) {
      const lineCount = (await readFile(file, "utf8")).split("\n").length;
      if (lineCount > 250) {
        oversized.push(`${relative(srcDir, file)}: ${lineCount}`);
      }
    }
    expect(oversized).toEqual([]);
  });

  test("keeps router lightweight", async () => {
    const router = await readFile(join(srcDir, "app/router.tsx"), "utf8");
    expect(router.split("\n").length).toBeLessThanOrEqual(80);
  });
});
