import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  it("renders public navigation and connection status", async () => {
    const user = userEvent.setup();
    const onHome = vi.fn();
    const onContact = vi.fn();

    render(
      <Header
        onHome={onHome}
        onNew={vi.fn()}
        onContact={onContact}
        onLogout={vi.fn()}
        error={false}
        errorMessage=""
        showNew
        authenticated={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Full-stack Notes/ }));
    await user.click(screen.getByRole("button", { name: "Contact" }));

    expect(onHome).toHaveBeenCalledOnce();
    expect(onContact).toHaveBeenCalledOnce();
    expect(screen.getByText("Ok.")).toBeVisible();
    expect(
      screen.getByText(
        "This site is a portfolio project in web development. Feel free to look around and read and react to the blog posts.",
      ),
    ).toBeVisible();
  });

  it("renders authenticated actions and error status", async () => {
    const user = userEvent.setup();
    const onNew = vi.fn();
    const onLogout = vi.fn();

    render(
      <Header
        onHome={vi.fn()}
        onNew={onNew}
        onContact={vi.fn()}
        onLogout={onLogout}
        error
        errorMessage="Could not fetch posts."
        showNew
        authenticated
      />,
    );

    await user.click(screen.getByRole("button", { name: /New Post/ }));
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(onNew).toHaveBeenCalledOnce();
    expect(onLogout).toHaveBeenCalledOnce();
    expect(screen.getByText("Could not fetch posts.")).toBeVisible();
  });
});
