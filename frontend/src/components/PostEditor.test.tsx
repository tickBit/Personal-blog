import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post } from "../types";
import PostEditor from "./PostEditor";

const { postNew, savePost } = vi.hoisted(() => ({
  postNew: vi.fn(),
  savePost: vi.fn(),
}));

vi.mock("@/services/postService", () => ({
  postService: {
    postNew,
    savePost,
  },
}));

const post: Post = {
  id: "42",
  slug: "existing-post",
  title: "Existing title",
  excerpt: "Existing excerpt",
  body: "Existing body",
  tags: ["existing", "test"],
  coverImage: "https://example.com/cover.jpg",
  createdAt: "2026-10-19T10:00:00.000Z",
  updatedAt: "2026-10-19T10:00:00.000Z",
  emojies: [0, 0, 0, 0, 0, 0, 0],
};

describe("PostEditor", () => {
  beforeEach(() => {
    postNew.mockReset();
    savePost.mockReset();
  });

  it("shows validation errors and does not save incomplete posts", async () => {
    const user = userEvent.setup();

    render(<PostEditor post={null} page={0} onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Publish Post" }));

    expect(screen.getByText("Title is required.")).toBeVisible();
    expect(screen.getByText("Excerpt is required.")).toBeVisible();
    expect(screen.getByText("Body is required.")).toBeVisible();
    expect(postNew).not.toHaveBeenCalled();
  });

  it("publishes a new post with parsed tags", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const savedPost = { ...post, id: "43", title: "New title" };
    postNew.mockResolvedValue(savedPost);

    render(<PostEditor post={null} page={0} onSave={onSave} onCancel={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("The title of your post"), "New title");
    await user.type(screen.getByPlaceholderText("A short teaser for the post…"), "New excerpt");
    await user.type(screen.getByPlaceholderText("Write the full post here…"), "New body");
    await user.type(screen.getByPlaceholderText("writing, craft, notes"), "react, vitest");
    await user.click(screen.getByRole("button", { name: "Publish Post" }));

    await waitFor(() => expect(postNew).toHaveBeenCalledOnce());
    expect(postNew).toHaveBeenCalledWith(0, {
      title: "New title",
      excerpt: "New excerpt",
      body: "New body",
      tags: ["react", "vitest"],
      coverImage: "",
    });
    expect(onSave).toHaveBeenCalledWith(savedPost);
  });

  it("loads existing data and saves edits", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const savedPost = { ...post, title: "Updated title" };
    savePost.mockResolvedValue(savedPost);

    render(<PostEditor post={post} page={2} onSave={onSave} onCancel={vi.fn()} />);

    expect(screen.getByDisplayValue("Existing title")).toBeVisible();
    expect(screen.getByDisplayValue("existing, test")).toBeVisible();

    const title = screen.getByPlaceholderText("The title of your post");
    await user.clear(title);
    await user.type(title, "Updated title");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(savePost).toHaveBeenCalledOnce());
    expect(savePost).toHaveBeenCalledWith(
      "42",
      expect.objectContaining({
        title: "Updated title",
        tags: ["existing", "test"],
      }),
      2,
    );
    expect(onSave).toHaveBeenCalledWith(savedPost);
  });
});
