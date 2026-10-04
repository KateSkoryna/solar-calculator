import { screen } from "@testing-library/react";
import RolePill from "./RolePill";
import { Role } from "@/app/generated/prisma/enums";
import { ROLE_DISPLAY } from "@/lib/role-display";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const roleLabels: Record<string, string> = englishMessages.roles;

describe("RolePill", () => {
  it.each(Object.values(Role))("renders a text label for %s", (role) => {
    renderWithIntl(<RolePill role={role} />);

    const label = roleLabels[ROLE_DISPLAY[role].messageKey];
    expect(label).toBeTruthy();
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
