import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

afterEach(() => vi.unstubAllGlobals());

describe("nutrition search API", () => {
  it("rejects invalid queries", async () => {
    const response = await GET(new NextRequest("http://localhost/api/nutricion/search?query=x"));
    expect(response.status).toBe(400);
  });

  it("clamps page size and transforms products", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      products: [{ id: "p1", product_name: "Café", nutriments: { "proteins_100g": 10 } }]
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await GET(new NextRequest("http://localhost/api/nutricion/search?query=cafe&pageSize=-8", {
      headers: { "x-forwarded-for": "test-transform" }
    }));
    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toContain("page_size=1");
    expect(await response.json()).toEqual({ foods: [expect.objectContaining({ fdcId: "p1", description: "Café" })] });
  });

  it("returns 502 when the provider fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
    const response = await GET(new NextRequest("http://localhost/api/nutricion/search?query=cafe", {
      headers: { "x-forwarded-for": "test-upstream" }
    }));
    expect(response.status).toBe(502);
  });
});
