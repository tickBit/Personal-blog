import { expect, test, type Page, type Route } from "@playwright/test";

const apiUrl = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:8080";

type MockPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  emojies: number[];
};

test("admin can publish a blog post", async ({ page }) => {
  const posts: MockPost[] = [];
  await mockApi(page, posts);

  await page.goto("/admin/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("test-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.getByRole("button", { name: "No / Ei" }).click();
  await page.getByRole("button", { name: "New Post" }).click();

  const postTitle = `Playwright test post ${Date.now()}`;
  await page.getByPlaceholder("The title of your post").fill(postTitle);
  await page.getByPlaceholder(/A short teaser for the post/).fill("Test excerpt");
  await page.getByPlaceholder(/Write the full post here/).fill("Test body");
  await page.getByPlaceholder("writing, craft, notes").fill("playwright");
  await page.getByRole("button", { name: "Publish Post" }).click();

  await expect(
    page.getByRole("button", { name: new RegExp(postTitle) }),
  ).toBeVisible();
  expect(posts).toHaveLength(1);
  expect(posts[0]).toMatchObject({
    title: postTitle,
    excerpt: "Test excerpt",
    body: "Test body",
    tags: ["playwright"],
  });
});

async function mockApi(page: Page, posts: MockPost[]) {
  await page.route(`${apiUrl}/**`, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (request.method() === "POST" && path === "/auth/login") {
      await json(route, 200, {
        accessToken: createMockJwt(),
        refreshToken: "mock-refresh-token",
      });
      return;
    }

    if (request.method() === "GET" && path === "/api/posts") {
      await json(route, 200, {
        content: posts,
        totalElements: posts.length,
        totalPages: posts.length === 0 ? 0 : 1,
        number: 0,
        size: 5,
      });
      return;
    }

    if (request.method() === "POST" && path === "/api/posts") {
      const input = request.postDataJSON() as Pick<
        MockPost,
        "title" | "excerpt" | "body" | "tags" | "coverImage"
      >;
      const now = new Date().toISOString();
      const post: MockPost = {
        ...input,
        id: "1",
        slug: "playwright-test-post",
        createdAt: now,
        updatedAt: now,
        emojies: [0, 0, 0, 0, 0, 0, 0],
      };
      posts.unshift(post);
      await json(route, 201, post);
      return;
    }

    await json(route, 404, { message: `No mock for ${request.method()} ${path}` });
  });
}

async function json(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

function createMockJwt() {
  const header = toBase64Url({ alg: "none", typ: "JWT" });
  const payload = toBase64Url({ exp: Math.floor(Date.now() / 1000) + 60 * 60 });
  return `${header}.${payload}.mock-signature`;
}

function toBase64Url(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}
