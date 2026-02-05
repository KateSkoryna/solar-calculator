import { render, screen } from "@testing-library/react";
import Home from "./[locale]/page";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (key === "title") return "Solar Calculator for Commercial Vehicles";
    if (key === "description")
      return "Coming soon: Calculate your solar panel ROI";
    if (key === "deploymentSuccess") return "Deployed successfully on Vercel!";
    return key;
  },
}));

describe("Home Page", () => {
  it("renders the Solar Calculator title", () => {
    render(<Home />);

    const heading = screen.getByRole("heading", {
      name: /Solar Calculator for Commercial Vehicles/i,
    });

    expect(heading).toBeInTheDocument();
  });

  it("displays the coming soon message", () => {
    render(<Home />);

    const message = screen.getByText(
      /Coming soon: Calculate your solar panel ROI/i,
    );

    expect(message).toBeInTheDocument();
  });
});
