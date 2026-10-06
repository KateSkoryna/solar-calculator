import {
  shortCityName,
  vehicleDisplayName,
  type NamedVehicle,
} from "@/lib/vehicle-display-name";

const vehicle: NamedVehicle = {
  name: null,
  manufacturer: "Ford",
  model: "Transit",
  city: "Berlin",
  quantity: 9,
  vehicleType: "VAN",
};

describe("vehicleDisplayName", () => {
  it("prefers the group name", () => {
    expect(
      vehicleDisplayName({ ...vehicle, name: "Berlin delivery vans" }, "Van"),
    ).toBe("Berlin delivery vans");
  });

  it("falls back to manufacturer and model", () => {
    expect(vehicleDisplayName(vehicle, "Van")).toBe("Ford Transit");
  });

  it("names quick-check vehicles after their city and type", () => {
    expect(
      vehicleDisplayName(
        { ...vehicle, manufacturer: "Quick check", model: "VAN" },
        "Van",
      ),
    ).toBe("Berlin 9 Van");
  });
});

describe("shortCityName", () => {
  it("drops the district and country", () => {
    expect(shortCityName("Madrid, Community of Madrid, Spain")).toBe("Madrid");
    expect(shortCityName("Tokyo, Japan")).toBe("Tokyo");
    expect(shortCityName("Berlin")).toBe("Berlin");
  });
});
