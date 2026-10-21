import axios, { AxiosError, HttpStatusCode } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_CONNECTION_ERROR, authService } from "./authService";

describe("authService.login", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("stores tokens and returns the response status after a successful login", async () => {
    vi.spyOn(axios, "post").mockResolvedValue({
      status: HttpStatusCode.Ok,
      data: { accessToken: "access-token", refreshToken: "refresh-token" },
    });

    const status = await authService.login("admin", "secret");

    expect(status).toBe(HttpStatusCode.Ok);
    expect(localStorage.getItem("blog_folio_access_token")).toBe("access-token");
    expect(localStorage.getItem("blog_folio_refresh_token")).toBe("refresh-token");
  });

  it("returns the HTTP error status", async () => {
    vi.spyOn(axios, "post").mockRejectedValue(
      new AxiosError("Unauthorized", "ERR_BAD_REQUEST", undefined, undefined, {
        status: HttpStatusCode.Unauthorized,
        statusText: "Unauthorized",
        headers: {},
        config: { headers: {} },
        data: {},
      }),
    );

    await expect(authService.login("admin", "wrong-password")).resolves.toBe(
      HttpStatusCode.Unauthorized,
    );
  });

  it("returns a connection error code when the server cannot be reached", async () => {
    vi.spyOn(axios, "post").mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));

    await expect(authService.login("admin", "secret")).resolves.toBe(AUTH_CONNECTION_ERROR);
  });
});
