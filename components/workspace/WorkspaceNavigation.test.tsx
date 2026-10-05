import { screen, within } from "@testing-library/react";
import WorkspaceIconRail from "./WorkspaceIconRail";
import WorkspaceSidebar from "./WorkspaceSidebar";
import WorkspaceTabBar from "./WorkspaceTabBar";
import { WORKSPACE_NAV_ITEMS } from "@/lib/workspace-nav";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const CURRENT_PATHNAME = "/en/berlin/calculations/calc_berlin_1";
const FLEET_SLUG = "berlin";

jest.mock("next/navigation", () => ({
  usePathname: () => CURRENT_PATHNAME,
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({ signOut: jest.fn() }));

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: jest.fn() }),
}));

const workspaceMessages = englishMessages.workspace;
const expectedLabels = WORKSPACE_NAV_ITEMS.map(
  ({ messageKey }) =>
    workspaceMessages.nav[messageKey as keyof typeof workspaceMessages.nav],
);
const expectedHrefs = WORKSPACE_NAV_ITEMS.map(
  ({ routeSuffix }) => `/en/${FLEET_SLUG}${routeSuffix}`,
);

const FLEETS = [{ id: "fleet_1", name: "Berlin Delivery", slug: FLEET_SLUG }];

const navigations = {
  sidebar: () =>
    renderWithIntl(
      <WorkspaceSidebar fleets={FLEETS} currentFleetSlug={FLEET_SLUG} />,
    ),
  "icon rail": () =>
    renderWithIntl(<WorkspaceIconRail currentFleetSlug={FLEET_SLUG} />),
  "tab bar": () =>
    renderWithIntl(<WorkspaceTabBar currentFleetSlug={FLEET_SLUG} />),
};

describe.each(Object.entries(navigations))("workspace %s", (_, render) => {
  beforeEach(() => {
    render();
  });

  it("is a labelled navigation", () => {
    expect(
      screen.getByRole("navigation", {
        name: workspaceMessages.mainNavigation,
      }),
    ).toBeInTheDocument();
  });

  it("lists exactly the workspace navigation items", () => {
    const links = within(screen.getByRole("navigation")).getAllByRole("link");

    expect(links.map((link) => link.textContent)).toEqual(expectedLabels);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      expectedHrefs,
    );
  });

  it("marks only the item for the current path as the current page", () => {
    const links = within(screen.getByRole("navigation")).getAllByRole("link");
    const currentLinks = links.filter(
      (link) => link.getAttribute("aria-current") === "page",
    );

    expect(currentLinks).toHaveLength(1);
    expect(currentLinks[0]).toHaveTextContent(
      workspaceMessages.nav.calculations,
    );
  });
});
