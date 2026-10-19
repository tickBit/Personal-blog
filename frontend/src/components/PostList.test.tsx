import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Post } from "../types";
import PostList from "./PostList";

const post: Post = {
  id: "42",
  slug: "testing-react-components",
  title: "Testing React components",
  excerpt: "A practical introduction to component tests.",
  body: "Test body",
  tags: ["testing", "react"],
  createdAt: "2026-10-19T10:00:00.000Z",
  updatedAt: "2026-10-19T10:00:00.000Z",
  emojies: [0, 0, 0, 0, 0, 0, 0],
};

describe("PostList", () => {
  it("shows an empty state when there are no posts", () => {
    render(
      <PostList
        posts={[]}
        page={0}
        totalElements={0}
        onPageChange={vi.fn()}
        onRead={vi.fn()}
      />,
    );

    expect(screen.getByText("No posts yet. Write something.")).toBeVisible();
  });

  it("opens the selected post", async () => {
    const user = userEvent.setup();
    const onRead = vi.fn();

    render(
      <PostList
        posts={[post]}
        page={0}
        totalElements={1}
        onPageChange={vi.fn()}
        onRead={onRead}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Testing React components/ }),
    );

    expect(onRead).toHaveBeenCalledWith("42");
  });

  it("changes pages and disables navigation at the boundaries", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    const { rerender } = render(
      <PostList
        posts={[post]}
        page={0}
        totalElements={6}
        onPageChange={onPageChange}
        onRead={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Previous/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Next/ }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    rerender(
      <PostList
        posts={[post]}
        page={1}
        totalElements={6}
        onPageChange={onPageChange}
        onRead={vi.fn()}
      />,
    );

    expect(screen.getByText("Page 2 of 2")).toBeVisible();
    expect(screen.getByRole("button", { name: /Next/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Previous/ }));
    expect(onPageChange).toHaveBeenLastCalledWith(0);
  });
});
