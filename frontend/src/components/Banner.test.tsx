import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Banner from "./Banner";

describe("Banner", () => {
  it("opens and exposes both language messages", () => {
    render(
      <Banner
        text_en="English message"
        text_fi="Finnish message"
        btn_no="No"
        btn_yes="Yes"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByText("English message")).toBeVisible();
    expect(screen.getByText("Finnish message")).toBeVisible();
  });

  it("closes and calls the selected action", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <Banner
        text_en="English message"
        text_fi="Finnish message"
        btn_no="No"
        btn_yes="Yes"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "No" }));
    expect(onCancel).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Yes" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
