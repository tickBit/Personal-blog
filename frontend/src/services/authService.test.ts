import axios, { AxiosError, AxiosHeaders, HttpStatusCode } from "axios";
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
        config: { headers: new AxiosHeaders() },
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

  it("returns an internal-server error when login tokens are missing", async () => {
    vi.spyOn(axios, "post").mockResolvedValue({
      status: HttpStatusCode.Ok,
      data: { accessToken: "access-token" },
    });

    await expect(authService.login("admin", "secret")).resolves.toBe(
      HttpStatusCode.InternalServerError,
    );
  });

  it("returns an internal-server error for a non-Axios login failure", async () => {
    vi.spyOn(axios, "post").mockRejectedValue(new Error("Unexpected failure"));

    await expect(authService.login("admin", "secret")).resolves.toBe(
      HttpStatusCode.InternalServerError,
    );
  });
});

describe("authService session handling", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("reports whether a refresh token is stored", () => {
    expect(authService.isAuthenticated()).toBe(false);

    localStorage.setItem("blog_folio_refresh_token", "refresh-token");

    expect(authService.isAuthenticated()).toBe(true);
  });

  it("removes both stored tokens on logout", () => {
    localStorage.setItem("blog_folio_access_token", "access-token");
    localStorage.setItem("blog_folio_refresh_token", "refresh-token");

    authService.logout();

    expect(localStorage.getItem("blog_folio_access_token")).toBeNull();
    expect(localStorage.getItem("blog_folio_refresh_token")).toBeNull();
  });

  it("returns an existing unexpired access token", async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const accessToken = `header.${btoa(JSON.stringify({ exp }))}.signature`;
    localStorage.setItem("blog_folio_access_token", accessToken);

    await expect(authService.getAccessToken()).resolves.toBe(accessToken);
  });

  it("returns null when no access or refresh token is available", async () => {
    await expect(authService.getAccessToken()).resolves.toBeNull();
  });

  it("refreshes an expired access token", async () => {
    const exp = Math.floor(Date.now() / 1000) - 3600;
    const expiredAccessToken = `header.${btoa(JSON.stringify({ exp }))}.signature`;
    localStorage.setItem("blog_folio_access_token", expiredAccessToken);
    localStorage.setItem("blog_folio_refresh_token", "refresh-token");

    vi.spyOn(axios, "post").mockResolvedValue({
      data: { accessToken: "new-access-token" },
    });

    await expect(authService.getAccessToken()).resolves.toBe("new-access-token");
    expect(localStorage.getItem("blog_folio_access_token")).toBe("new-access-token");
  });

  it("clears tokens and returns null when refresh fails", async () => {
    localStorage.setItem("blog_folio_access_token", "expired-access-token");
    localStorage.setItem("blog_folio_refresh_token", "refresh-token");
    vi.spyOn(axios, "post").mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));

    await expect(authService.getAccessToken()).resolves.toBeNull();
    expect(localStorage.getItem("blog_folio_access_token")).toBeNull();
    expect(localStorage.getItem("blog_folio_refresh_token")).toBeNull();
  });
});
