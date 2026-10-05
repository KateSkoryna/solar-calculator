export function stubChartEnvironment() {
  window.ResizeObserver = class {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  };
  jest.spyOn(console, "warn").mockImplementation(() => {});
}
