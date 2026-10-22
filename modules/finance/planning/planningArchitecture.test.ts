import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") ? [path] : [];
  });
}

describe("finance planning architecture", () => {
  it("keeps planning calculations independent from persistence and UI", () => {
    const source = sourceFiles(process.cwd() + "/modules/finance/planning").map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/firebase|services\/firebase|@\/app\/|from ["']react["']/i);
    expect(source).not.toMatch(/@\/modules\/(health|sales|pet|goals)\//);
  });
});
