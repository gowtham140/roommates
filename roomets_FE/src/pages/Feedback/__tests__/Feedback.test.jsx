import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Feedback from "../Feedback";
import { submitFeedback } from "../../../API/feedbackAPI";

vi.mock("../../../API/feedbackAPI", () => ({
  submitFeedback: vi.fn(),
}));

describe("Feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    submitFeedback.mockResolvedValue({});
  });

  it("submits a suggestion", async () => {
    render(<Feedback />);

    fireEvent.change(screen.getByPlaceholderText(/describe your suggestion/i), {
      target: { value: "Please add more filters" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    await waitFor(() =>
      expect(submitFeedback).toHaveBeenCalledWith({
        category: "Suggestion",
        message: "Please add more filters",
      })
    );
    expect(await screen.findByText(/thank you/i)).toBeTruthy();
  });

  it("rejects a message that is too short", async () => {
    render(<Feedback />);

    fireEvent.change(screen.getByPlaceholderText(/describe your suggestion/i), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit feedback/i }));

    expect(await screen.findByText(/at least 10 characters/i)).toBeTruthy();
    expect(submitFeedback).not.toHaveBeenCalled();
  });
});
