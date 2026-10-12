import { afterEach, describe, expect, it, vi } from "vitest";
import { requestJson } from "@shooter/api/http";

afterEach(() => vi.unstubAllGlobals());

describe("HTTP client", () => {
  it("accepts a successful empty DELETE response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(requestJson<void>("/admin/games/1/", { method: "DELETE" })).resolves.toBeUndefined();
  });
  it("retains serializer field errors and HTTP status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ title: ["This field is required."] }), { status: 400 })));
    await expect(requestJson("/admin/games/", { method: "POST", body: "{}" })).rejects.toMatchObject({ status: 400, fields: { title: ["This field is required."] } });
  });
  it("retains authentication headers and sends JSON", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    await requestJson("/admin/games/", { headers: { Authorization: "Bearer token" }, method: "POST", body: "{}" });
    const headers = fetch.mock.calls[0][1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});
