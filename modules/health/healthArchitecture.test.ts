import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

describe("health module boundary", () => {
  it("does not import application-layer modules", () => {
    const forbidden = sourceFiles(join(process.cwd(), "modules", "health"))
      .filter((file) => !file.endsWith("healthArchitecture.test.ts"))
      .flatMap((file) => readFileSync(file, "utf8").match(/@\/app\//g) || []);
    expect(forbidden).toEqual([]);
  });
});
