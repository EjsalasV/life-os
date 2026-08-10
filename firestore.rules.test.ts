import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const rules = readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8");

describe("Firestore rule regressions", () => {
  it.each(["fijos", "metas", "habitos"])("does not bypass %s create validation", (collection) => {
    const block = rules.match(new RegExp(`match /${collection}/\\{[^}]+\\} \\{([\\s\\S]*?)\\n      \\}`))?.[1] || "";
    expect(block).not.toContain("allow read, write:");
    expect(block).toContain("allow create: if isOwner(userId)");
  });

  it("keeps demo plans constrained to known values", () => {
    expect(rules).toContain("request.resource.data.plan in ['free', 'pro']");
    expect(rules).toContain("request.resource.data.email == request.auth.token.email");
  });
});
