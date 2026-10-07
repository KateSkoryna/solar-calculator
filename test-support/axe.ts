import { configureAxe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

const axe = configureAxe({ rules: { region: { enabled: false } } });

export async function expectNoAxeViolations(container: HTMLElement) {
  expect(await axe(container)).toHaveNoViolations();
}
