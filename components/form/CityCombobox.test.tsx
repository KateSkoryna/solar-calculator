import { useState } from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CityCombobox from "./CityCombobox";
import type { CalculatorCity } from "@/lib/calculator-form";
import { CitySearchError, fetchCities } from "@/lib/geocode-client";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

jest.mock("@/lib/geocode-client", () => ({
  ...jest.requireActual("@/lib/geocode-client"),
  CITY_SEARCH_DEBOUNCE_MS: 0,
  fetchCities: jest.fn(),
}));

const cityMessages = englishMessages.calculator.city;
const mockedFetchCities = jest.mocked(fetchCities);
const CITY_LABEL = "City";

const CITIES = [
  {
    name: "Berlin",
    detail: "Germany",
    label: "Berlin, Germany",
    countryCode: "DE" as const,
    latitude: 52.52,
    longitude: 13.405,
  },
  {
    name: "Berlingo",
    detail: "Brescia, Italy",
    label: "Berlingo, Brescia, Italy",
    countryCode: "IT" as const,
    latitude: 45.5,
    longitude: 10.03,
  },
];

function ControlledCityCombobox({
  onChange,
}: {
  onChange?: (city: CalculatorCity | null) => void;
}) {
  const [city, setCity] = useState<CalculatorCity | null>(null);

  return (
    <CityCombobox
      label={CITY_LABEL}
      value={city}
      onChange={(nextCity) => {
        setCity(nextCity);
        onChange?.(nextCity);
      }}
    />
  );
}

function getCityField() {
  return screen.getByRole("combobox", { name: CITY_LABEL });
}

beforeEach(() => {
  mockedFetchCities.mockReset();
  mockedFetchCities.mockResolvedValue(CITIES);
});

describe("CityCombobox", () => {
  it("is a collapsed combobox that controls a listbox", () => {
    renderWithIntl(<ControlledCityCombobox />);
    const cityField = getCityField();

    expect(cityField).toHaveAttribute("aria-expanded", "false");
    expect(cityField).toHaveAttribute("aria-autocomplete", "list");
    expect(
      document.getElementById(cityField.getAttribute("aria-controls") ?? ""),
    ).toHaveAttribute("role", "listbox");
  });

  it("does not search for a single character", async () => {
    renderWithIntl(<ControlledCityCombobox />);

    await userEvent.type(getCityField(), "B");

    expect(mockedFetchCities).not.toHaveBeenCalled();
  });

  it("lists the cities with their name and detail and expands", async () => {
    renderWithIntl(<ControlledCityCombobox />);

    await userEvent.type(getCityField(), "Ber");

    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(CITIES.length);
    expect(options[1]).toHaveTextContent("Berlingo");
    expect(options[1]).toHaveTextContent("Brescia, Italy");
    expect(getCityField()).toHaveAttribute("aria-expanded", "true");
    expect(mockedFetchCities).toHaveBeenLastCalledWith(
      "Ber",
      "en",
      expect.any(AbortSignal),
    );
  });

  it("moves the active option with the arrow keys and selects it with Enter", async () => {
    const handleChange = jest.fn();
    renderWithIntl(<ControlledCityCombobox onChange={handleChange} />);
    const cityField = getCityField();
    await userEvent.type(cityField, "Ber");
    const options = await screen.findAllByRole("option");

    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(cityField).toHaveAttribute("aria-activedescendant", options[1].id);
    expect(options[1]).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowUp}{Enter}");

    expect(handleChange).toHaveBeenLastCalledWith({
      label: "Berlin, Germany",
      countryCode: "DE",
      latitude: 52.52,
      longitude: 13.405,
    });
    expect(cityField).toHaveValue("Berlin, Germany");
    expect(cityField).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the list on Escape", async () => {
    renderWithIntl(<ControlledCityCombobox />);
    await userEvent.type(getCityField(), "Ber");
    await screen.findAllByRole("option");

    await userEvent.keyboard("{Escape}");

    expect(getCityField()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("clears the chosen city when the text is edited again", async () => {
    const handleChange = jest.fn();
    renderWithIntl(<ControlledCityCombobox onChange={handleChange} />);
    await userEvent.type(getCityField(), "Ber");
    await userEvent.click(
      await screen.findByRole("option", { name: /^Berlin\b/ }),
    );

    await userEvent.type(getCityField(), "x");

    expect(handleChange).toHaveBeenLastCalledWith(null);
  });

  it("says when no city was found", async () => {
    mockedFetchCities.mockResolvedValue([]);
    renderWithIntl(<ControlledCityCombobox />);

    await userEvent.type(getCityField(), "Zzzz");

    expect(await screen.findByText(cityMessages.noResults)).toBeInTheDocument();
  });

  it("says when the search is unavailable", async () => {
    mockedFetchCities.mockRejectedValue(new CitySearchError());
    renderWithIntl(<ControlledCityCombobox />);

    await userEvent.type(getCityField(), "Ber");

    await waitFor(() =>
      expect(screen.getByText(cityMessages.unavailable)).toBeInTheDocument(),
    );
  });

  it("removes the old options as soon as the text changes", async () => {
    renderWithIntl(<ControlledCityCombobox />);
    await userEvent.type(getCityField(), "Ber");
    await screen.findAllByRole("option");
    mockedFetchCities.mockReturnValue(new Promise(() => undefined));

    await userEvent.type(getCityField(), "x");

    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
});
