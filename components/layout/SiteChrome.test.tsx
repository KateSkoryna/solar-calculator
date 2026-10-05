import { render, screen } from "@testing-library/react";
import SiteChrome from "./SiteChrome";

const usePathnameMock = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

function renderChrome() {
  render(
    <SiteChrome
      header={<header>Header</header>}
      footer={<footer>Footer</footer>}
    >
      <p>Page</p>
    </SiteChrome>,
  );
}

describe("SiteChrome", () => {
  it("wraps ordinary pages with the header and footer", () => {
    usePathnameMock.mockReturnValue("/en/calculator");

    renderChrome();

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Page")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("leaves the sign-in screens to fill the whole window", () => {
    usePathnameMock.mockReturnValue("/en/login");

    renderChrome();

    expect(screen.queryByText("Header")).not.toBeInTheDocument();
    expect(screen.getByText("Page")).toBeInTheDocument();
    expect(screen.queryByText("Footer")).not.toBeInTheDocument();
  });
});
