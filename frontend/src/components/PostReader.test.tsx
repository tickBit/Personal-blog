import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post } from "../types";
import { GuestProvider, STORAGE_KEY } from "../context/GuestContext";
import PostReader from "./PostReader";

vi.mock("@/services/authService", () => ({
  authService: {
    isAuthenticated: () => false,
  },
}));

const post: Post = {
  id: "42",
  slug: "reader-test",
  title: "Reader test",
  excerpt: "Reader excerpt",
  body: "First paragraph\n> Quoted text\n**Bold heading**",
  tags: ["testing", "reader"],
  coverImage: "https://example.com/cover.jpg",
  createdAt: "2026-10-19T10:00:00.000Z",
  updatedAt: "2026-10-20T10:00:00.000Z",
  emojies: [0.5, 0, 0, 0, 0, 0, 0],
};

describe("PostReader", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders post metadata, cover image, tags, and formatted body", () => {
    render(
      <GuestProvider>
        <PostReader
          post={{ ...post, emojies: [...post.emojies] }}
          deleteConfirm={false}
          onCancelDelete={vi.fn()}
          onReaction={vi.fn().mockResolvedValue(200)}
          onDeleteReactions={vi.fn()}
          onGetEmojiAmounts={vi.fn().mockResolvedValue([1, 0, 0, 0, 0, 0, 0])}
          onSetAmountEmoji={vi.fn().mockResolvedValue(200)}
        />
      </GuestProvider>,
    );

    expect(screen.getByRole("heading", { name: "Reader test" })).toBeVisible();
    expect(screen.getByText("Reader excerpt")).toBeVisible();
    expect(screen.getByText("testing")).toBeVisible();
    expect(screen.getByText("First paragraph")).toBeVisible();
    expect(screen.getByText("Quoted text")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Bold heading" })).toBeVisible();
    expect(screen.getByRole("img", { name: "Reader test" })).toBeVisible();
  });

  it("supports edit and delete confirmation actions", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onCancelDelete = vi.fn();

    render(
      <GuestProvider>
        <PostReader
          post={{ ...post, emojies: [...post.emojies] }}
          onEdit={onEdit}
          onDelete={onDelete}
          deleteConfirm
          onCancelDelete={onCancelDelete}
          onReaction={vi.fn().mockResolvedValue(200)}
          onDeleteReactions={vi.fn()}
          onGetEmojiAmounts={vi.fn().mockResolvedValue([1, 0, 0, 0, 0, 0, 0])}
          onSetAmountEmoji={vi.fn().mockResolvedValue(200)}
        />
      </GuestProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Edit Post" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onEdit).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onCancelDelete).toHaveBeenCalledOnce();
  });

  it("opens consent before a guest reaction is confirmed", async () => {
    const user = userEvent.setup();

    render(
      <GuestProvider>
        <PostReader
          post={{ ...post, emojies: [...post.emojies] }}
          deleteConfirm={false}
          onCancelDelete={vi.fn()}
          onReaction={vi.fn().mockResolvedValue(200)}
          onDeleteReactions={vi.fn()}
          onGetEmojiAmounts={vi.fn().mockResolvedValue([1, 0, 0, 0, 0, 0, 0])}
          onSetAmountEmoji={vi.fn().mockResolvedValue(200)}
        />
      </GuestProvider>,
    );

    const reaction = screen.getAllByText("😄")[0];
    await user.click(reaction);

    expect(screen.getByText(/give a concent/i)).toBeVisible();
  });
});
