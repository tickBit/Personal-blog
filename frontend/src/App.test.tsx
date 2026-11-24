import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post } from "./types";
import { GuestProvider } from "./context/GuestContext";
import App from "./App";

const { readPosts, login } = vi.hoisted(() => ({
  readPosts: vi.fn(),
  login: vi.fn(),
}));

vi.mock("./services/postService", () => ({
  postService: {
    readPosts,
    deletePost: vi.fn(),
    deleteAllReactions: vi.fn(),
    reactToPost: vi.fn(),
    getAmountOfEmojis: vi.fn(),
    postAmountOfEmoji: vi.fn(),
  },
}));

vi.mock("./services/authService", () => ({
  AUTH_CONNECTION_ERROR: 0,
  authService: {
    isAuthenticated: () => false,
    login,
    logout: vi.fn(),
  },
}));

const post: Post = {
  id: "42",
  slug: "app-test",
  title: "App test post",
  excerpt: "Loaded by App",
  body: "App test body",
  tags: ["app"],
  createdAt: "2026-10-19T10:00:00.000Z",
  updatedAt: "2026-10-19T10:00:00.000Z",
  emojies: [0, 0, 0, 0, 0, 0, 0],
};

describe("App", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    readPosts.mockReset();
    login.mockReset();
    window.history.pushState({}, "", "/");
  });

  it("loads and renders posts in the list view", async () => {
    readPosts.mockResolvedValue({
      data: {
        content: [post],
        totalElements: 1,
      },
    });

    render(
      <GuestProvider>
        <App />
      </GuestProvider>,
    );

    await waitFor(() => expect(readPosts).toHaveBeenCalled());
    expect(await screen.findByText("App test post")).toBeVisible();
  });

  it("renders the login view for the admin route", () => {
    window.history.pushState({}, "", "/admin/login");

    render(
      <GuestProvider>
        <App />
      </GuestProvider>,
    );

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  it("shows a fetch error and clears posts when loading fails", async () => {
    readPosts.mockResolvedValue(500);

    render(
      <GuestProvider>
        <App />
      </GuestProvider>,
    );

    expect(await screen.findByText("Could not fetch the posts.")).toBeVisible();
    expect(screen.getByText("No posts yet. Write something.")).toBeVisible();
  });

  it("shows an invalid-credentials error after an unauthorized login", async () => {
    const user = userEvent.setup();
    login.mockResolvedValue(401);
    window.history.pushState({}, "", "/admin/login");

    render(
      <GuestProvider>
        <App />
      </GuestProvider>,
    );

    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid username or password.")).toBeVisible();
  });

  it("shows a connection error after login cannot reach the server", async () => {
    const user = userEvent.setup();
    login.mockResolvedValue(0);
    window.history.pushState({}, "", "/admin/login");

    render(
      <GuestProvider>
        <App />
      </GuestProvider>,
    );

    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Could not connect to the server.")).toBeVisible();
  });

  it("shows a temporary-service error for login server failures", async () => {
    const user = userEvent.setup();
    login.mockResolvedValue(503);
    window.history.pushState({}, "", "/admin/login");

    render(
      <GuestProvider>
        <App />
      </GuestProvider>,
    );

    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Login service is temporarily unavailable.")).toBeVisible();
  });
});
