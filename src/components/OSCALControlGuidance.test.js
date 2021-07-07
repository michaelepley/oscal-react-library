import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OSCALControlGuidance from "./OSCALControlGuidance";

test("OSCALCatalog displays control guidance", () => {
  const prose = "Access control policy";
  render(<OSCALControlGuidance prose={prose} />);
  userEvent.click(screen.getByRole("button"));
  const result = screen.getByText("Access control policy");
  expect(result).toBeVisible();
});