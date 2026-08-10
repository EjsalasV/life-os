import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

describe("observability API", () => {
  it("accepts structured events", async () => {
    const response = await POST(new NextRequest("http://localhost/api/observability", {
      method: "POST",
      body: JSON.stringify({ type: "web_vital", metric: { name: "LCP", value: 100 } })
    }));
    expect(response.status).toBe(202);
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(new NextRequest("http://localhost/api/observability", { method: "POST", body: "{" }));
    expect(response.status).toBe(400);
  });
});
