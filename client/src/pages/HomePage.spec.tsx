import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./HomePage";

describe("HomePage", () => {
  it("renders HomePage", () => {
    render(<HomePage />);

    expect(screen.getByText(/add a todo/i)).toBeInTheDocument();
  });
});
