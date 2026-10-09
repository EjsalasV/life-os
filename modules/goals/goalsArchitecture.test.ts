import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|js|jsx)$/.test(entry.name) && !entry.name.endsWith(".test.ts") ? [path] : [];
  });
}

describe("Goals core architecture", () => {
  it("does not depend on Firebase, app, React, or other domains", () => {
    const root = join(process.cwd(), "modules", "goals");
    const coreFiles = sourceFiles(join(root, "types")).concat(sourceFiles(join(root, "schemas")), sourceFiles(join(root, "domain")));
    const source = coreFiles.map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/firebase|services\/firebase|@\/app\/|from ["']react["']/i);
    expect(source).not.toMatch(/@\/modules\/(finance|health|sales|pet|auth)\//);
    expect(coreFiles.every((file) => statSync(file).isFile())).toBe(true);
  });
});
