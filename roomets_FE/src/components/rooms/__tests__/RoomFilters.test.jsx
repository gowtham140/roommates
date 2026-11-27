import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import RoomFilters from "../RoomFilters";

const baseValues = {
  location: "",
  minRent: "",
  maxRent: "",
  roomType: "",
  gender: "",
  food: "",
  foodPreference: "",
  sort: "recommended",
};

describe("RoomFilters", () => {
  it("submits only when the user clicks search", () => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();
    render(<RoomFilters values={baseValues} onChange={onChange} onSubmit={onSubmit} />);

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Location" }));
    expect(screen.getByRole("option", { name: "Anna Nagar" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Tambaram" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: "Tambaram" }));
    expect(onChange).toHaveBeenCalledWith("location", "Tambaram");
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Search rooms" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("associates visible labels with their fields", () => {
    render(<RoomFilters values={baseValues} onChange={() => {}} onSubmit={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Location" })).toBeInTheDocument();
    expect(screen.getByLabelText("Min rent")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Room type" })).toBeInTheDocument();
  });

  it("blocks search when min rent is greater than max rent", () => {
    render(
      <RoomFilters
        values={{ ...baseValues, minRent: "5000", maxRent: "1000" }}
        onChange={() => {}}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: "Search rooms" })).toBeDisabled();
    expect(screen.getByText("Max rent must be at least min rent")).toBeInTheDocument();
  });
});
