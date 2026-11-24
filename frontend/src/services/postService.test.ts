import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const axiosCall = vi.fn() as ReturnType<typeof vi.fn> & {
    post: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
  };
  axiosCall.post = vi.fn();
  axiosCall.delete = vi.fn();
  axiosCall.put = vi.fn();

  return {
    axiosCall,
    getAccessToken: vi.fn(),
  };
});

vi.mock("axios", () => ({
  default: mocks.axiosCall,
  AxiosError: class AxiosError extends Error {},
  HttpStatusCode: {
    Ok: 200,
    Created: 201,
    Unauthorized: 401,
    Forbidden: 403,
    TooManyRequests: 429,
    InternalServerError: 500,
  },
}));

vi.mock("./authService", () => ({
  authService: {
    getAccessToken: mocks.getAccessToken,
  },
}));

import { postService } from "./postService";

describe("postService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAccessToken.mockResolvedValue("access-token");
  });

  it("reads a page of posts", async () => {
    const response = { data: { content: [], totalElements: 0 } };
    mocks.axiosCall.mockResolvedValue(response);

    await expect(postService.readPosts(0, 5)).resolves.toBe(response);
    expect(mocks.axiosCall).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
        params: expect.objectContaining({ page: 0, size: 5 }),
      }),
    );
  });

  it("returns the response HTTP status when reading posts fails", async () => {
    mocks.axiosCall.mockRejectedValue({ response: { status: 503 } });

    await expect(postService.readPosts(0, 5)).resolves.toBe(503);
  });

  it("returns 500 when reading posts fails without an HTTP status", async () => {
    mocks.axiosCall.mockRejectedValue(new Error("Network failure"));

    await expect(postService.readPosts(0, 5)).resolves.toBe(500);
  });

  it("gets reaction amounts", async () => {
    mocks.axiosCall.mockResolvedValue({ data: [1, 2, 3] });

    await expect(postService.getAmountOfEmojis("42")).resolves.toEqual([1, 2, 3]);
  });

  it("returns an HTTP status when getting reaction amounts fails", async () => {
    mocks.axiosCall.mockRejectedValue({ response: { status: 403 } });

    await expect(postService.getAmountOfEmojis("42")).resolves.toBe(403);
  });

  it("adds a reaction amount", async () => {
    mocks.axiosCall.post.mockResolvedValue({ status: 200 });

    await expect(postService.postAmountOfEmoji("42", 1, 3)).resolves.toBe(200);
  });

  it("returns 500 when adding a reaction amount fails", async () => {
    mocks.axiosCall.post.mockRejectedValue(new Error("Network failure"));

    await expect(postService.postAmountOfEmoji("42", 1, 3)).resolves.toBe(500);
  });

  it("submits a reaction", async () => {
    mocks.axiosCall.post.mockResolvedValue({ status: 200 });

    await expect(postService.reactToPost("42", "heart")).resolves.toBe(200);
  });

  it("returns a rate-limit status when submitting a reaction fails", async () => {
    mocks.axiosCall.post.mockRejectedValue({ response: { status: 429 } });

    await expect(postService.reactToPost("42", "heart")).resolves.toBe(429);
  });

  it("deletes all reactions", async () => {
    mocks.axiosCall.delete.mockResolvedValue({ status: 204 });

    await expect(postService.deleteAllReactions("42")).resolves.toBe(204);
  });

  it("deletes a post", async () => {
    mocks.axiosCall.delete.mockResolvedValue({ status: 204 });

    await expect(postService.deletePost("42", 0)).resolves.toEqual({ status: 204 });
  });

  it("returns an HTTP status when deleting a post fails", async () => {
    mocks.axiosCall.delete.mockRejectedValue({ response: { status: 401 } });

    await expect(postService.deletePost("42", 0)).resolves.toBe(401);
  });

  it("updates an existing post", async () => {
    const updatedPost = {
      id: "42",
      title: "Updated",
      slug: "updated",
      excerpt: "Updated excerpt",
      body: "Updated body",
      tags: ["test"],
      createdAt: "2026-10-19T10:00:00.000Z",
      updatedAt: "2026-10-19T11:00:00.000Z",
      emojies: [0, 0, 0, 0, 0, 0, 0],
    };
    mocks.axiosCall.put.mockResolvedValue({ status: 201, data: updatedPost });

    await expect(
      postService.savePost("42", {
        title: "Updated",
        excerpt: "Updated excerpt",
        body: "Updated body",
        tags: ["test"],
      }, 0),
    ).resolves.toEqual(updatedPost);
  });

  it("creates a post", async () => {
    const createdPost = {
      id: "43",
      title: "Created",
      slug: "created",
      excerpt: "Created excerpt",
      body: "Created body",
      tags: ["test"],
      createdAt: "2026-10-19T10:00:00.000Z",
      updatedAt: "2026-10-19T10:00:00.000Z",
      emojies: [0, 0, 0, 0, 0, 0, 0],
    };
    mocks.axiosCall.post.mockResolvedValue({ status: 201, data: createdPost });

    await expect(
      postService.postNew(0, {
        title: "Created",
        excerpt: "Created excerpt",
        body: "Created body",
        tags: ["test"],
      }),
    ).resolves.toEqual(createdPost);
  });
});
