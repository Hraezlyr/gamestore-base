import { describe, expect, it, vi } from "vitest";
import { SessionManager } from "../../services/session";
import { HttpError } from "../../api/errors";

function setup() {
  const api = {
    login: vi.fn().mockResolvedValue({ access: "old", refresh: "refresh" }),
    checkAccess: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue({ access: "new" }),
  };
  const changed = vi.fn();
  const session = new SessionManager(api, changed);
  return { api, changed, session };
}
const credentials = { username: "admin", password: "test-only" };

describe("SessionManager", () => {
  it("does not retain tokens when the user lacks permissions", async () => {
    const { api, changed, session } = setup();
    api.checkAccess.mockRejectedValue(new HttpError(403, "Forbidden"));
    await expect(session.login(credentials)).rejects.toMatchObject({ status: 403 });
    expect(changed).not.toHaveBeenCalled();
    await expect(session.request(vi.fn())).rejects.toThrow("Inicia sesión");
  });

  it("renews once for concurrent expired requests and retries with the new token", async () => {
    const { api, session } = setup();
    await session.login(credentials);
    const operation = vi.fn(async (token: string) => {
      if (token === "old") throw new HttpError(401, "Expired");
      return token;
    });
    expect(await Promise.all([session.request(operation), session.request(operation)])).toEqual(["new", "new"]);
    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(api.refresh).toHaveBeenCalledWith("refresh");
  });

  it("does not refresh permission errors", async () => {
    const { api, session } = setup();
    await session.login(credentials);
    await expect(session.request(async () => { throw new HttpError(403, "Forbidden"); })).rejects.toMatchObject({ status: 403 });
    expect(api.refresh).not.toHaveBeenCalled();
  });

  it("ends the session when the refresh token is invalid", async () => {
    const { api, changed, session } = setup();
    await session.login(credentials);
    api.refresh.mockRejectedValue(new HttpError(401, "Invalid refresh"));
    await expect(session.request(async () => { throw new HttpError(401, "Expired"); })).rejects.toMatchObject({ status: 401 });
    expect(changed).toHaveBeenLastCalledWith(false);
    await expect(session.request(vi.fn())).rejects.toThrow("Inicia sesión");
  });

  it("preserves the session when renewal fails due to a temporary network error", async () => {
    const { api, changed, session } = setup();
    await session.login(credentials);
    api.refresh.mockRejectedValue(new TypeError("Network"));
    await expect(session.request(async () => { throw new HttpError(401, "Expired"); })).rejects.toThrow("Network");
    expect(changed).toHaveBeenLastCalledWith(true);
    expect(await session.request(async () => "still-authenticated")).toBe("still-authenticated");
  });

  it("does not restore a session when a refresh completes after logout", async () => {
    const { api, session } = setup();
    await session.login(credentials);
    let resolve!: (value: { access: string }) => void;
    api.refresh.mockImplementation(() => new Promise(done => { resolve = done; }));
    const pending = session.request(async () => { throw new HttpError(401, "Expired"); });
    const rejected = expect(pending).rejects.toThrow("finalizado");
    await vi.waitFor(() => expect(api.refresh).toHaveBeenCalled());
    session.logout();
    resolve({ access: "late" });
    await rejected;
    await expect(session.request(vi.fn())).rejects.toThrow("Inicia sesión");
  });

  it("stops after one retry when the new token is also rejected", async () => {
    const { api, session } = setup();
    await session.login(credentials);
    const operation = vi.fn().mockRejectedValue(new HttpError(401, "Invalid"));
    await expect(session.request(operation)).rejects.toMatchObject({ status: 401 });
    expect(operation).toHaveBeenCalledTimes(2);
    expect(api.refresh).toHaveBeenCalledTimes(1);
  });

  it("does not apply an old response after logout", async () => {
    const { session } = setup();
    await session.login(credentials);
    let resolve!: (value: string) => void;
    const pending = session.request(() => new Promise<string>(done => { resolve = done; }));
    const rejected = expect(pending).rejects.toThrow("finalizado");
    session.logout();
    resolve("late");
    await rejected;
  });
});
