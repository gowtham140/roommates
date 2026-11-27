import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminFeedback from "../AdminFeedback";
import { getAdminFeedback } from "../../../API/feedbackAPI";

vi.mock("../../../API/feedbackAPI", () => ({
  getAdminFeedback: vi.fn(),
}));

describe("AdminFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminFeedback.mockResolvedValue([
      {
        id: 1,
        userName: "Asha",
        email: "asha@example.com",
        userType: "3",
        category: "Improvement",
        message: "Please add more filters",
        createdAt: "2026-11-27T10:30:00",
      },
    ]);
  });

  it("shows feedback submitted by users", async () => {
    render(<AdminFeedback />);

    await waitFor(() => expect(getAdminFeedback).toHaveBeenCalled());
    expect((await screen.findAllByText("Asha")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Please add more filters")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Seeker")).length).toBeGreaterThan(0);
  });
});
