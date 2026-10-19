import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type APIRequestContext } from "@playwright/test";

const apiUrl = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:8080";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

test("admin can publish a blog post", async ({ page, request }) => {
  const credentials = loadAdminCredentials();
  const tokens = await login(request, credentials);
  const postTitle = `Playwright test post ${Date.now()}`;
  let createdPostId: string | undefined;

  await page.addInitScript((loginTokens: LoginResponse) => {
    localStorage.setItem("blog_folio_access_token", loginTokens.accessToken);
    localStorage.setItem("blog_folio_refresh_token", loginTokens.refreshToken);
  }, tokens);

  try {
    await page.goto("/");
    await page.getByRole("button", { name: "No / Ei" }).click();
    await page.getByRole("button", { name: "New Post" }).click();

    await page.getByPlaceholder("The title of your post").fill(postTitle);
    await page.getByPlaceholder(/A short teaser for the post/).fill("Test excerpt");
    await page.getByPlaceholder(/Write the full post here/).fill("Test body");
    await page.getByPlaceholder("writing, craft, notes").fill("playwright");

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url() === `${apiUrl}/api/posts` &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Publish Post" }).click();

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    const createdPost = (await createResponse.json()) as { id: string | number };
    createdPostId = String(createdPost.id);

    await expect(
      page.getByRole("button", { name: new RegExp(postTitle) }),
    ).toBeVisible();
  } finally {
    if (createdPostId) {
      const deleteResponse = await request.delete(
        `${apiUrl}/api/posts/${createdPostId}`,
        { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
      );
      expect(deleteResponse.status()).toBe(204);
    }
  }
});

async function login(
  request: APIRequestContext,
  credentials: { username: string; password: string },
): Promise<LoginResponse> {
  const response = await request.post(`${apiUrl}/auth/login`, {
    data: credentials,
  });

  expect(response.ok(), "Admin login failed").toBe(true);
  return response.json() as Promise<LoginResponse>;
}

function loadAdminCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (username && password) return { username, password };

  const values = Object.fromEntries(
    readFileSync(resolve(process.cwd(), "../backend/.env"), "utf8")
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trimStart().startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );

  if (!values.ADMIN_USERNAME || !values.ADMIN_PASSWORD) {
    throw new Error(
      "Set ADMIN_USERNAME and ADMIN_PASSWORD or define them in backend/.env",
    );
  }

  return {
    username: values.ADMIN_USERNAME,
    password: values.ADMIN_PASSWORD,
  };
}
