import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [path] : [];
  });
}

describe("domain contract boundaries", () => {
  it("keeps finance and sales production code off global app contracts", () => {
    for (const domain of ["finance", "sales"]) {
      const violations = sourceFiles(join(process.cwd(), "modules", domain))
        .filter((file) => !file.endsWith(".test.ts") && !file.endsWith(".test.js"))
        .flatMap((file) => (readFileSync(file, "utf8").match(/@\/app\/(types|schemas)/g) || []).map((match) => `${file}: ${match}`));
      expect(violations, domain).toEqual([]);
    }
  });
});
