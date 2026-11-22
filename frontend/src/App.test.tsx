import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post } from "./types";
import { GuestProvider } from "./context/GuestContext";
import App from "./App";

const { readPosts } = vi.hoisted(() => ({
  readPosts: vi.fn(),
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
    login: vi.fn(),
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
});
