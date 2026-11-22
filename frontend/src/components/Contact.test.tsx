import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Contact from "./Contact";

describe("Contact", () => {
  it("shows contact content and returns to the previous view", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<Contact onContact={vi.fn()} onCancel={onCancel} />);

    expect(screen.getByRole("heading", { name: "Contact me" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
