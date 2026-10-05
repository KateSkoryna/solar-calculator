export function stubDialogElement() {
  HTMLDialogElement.prototype.showModal = jest.fn(function showModal(
    this: HTMLDialogElement,
  ) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = jest.fn(function close(
    this: HTMLDialogElement,
  ) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
}

type ViewportChangeListener = (event: MediaQueryListEvent) => void;

export function stubMatchMedia() {
  const changeListeners = new Set<ViewportChangeListener>();
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: (_type: string, listener: ViewportChangeListener) =>
      changeListeners.add(listener),
    removeEventListener: (_type: string, listener: ViewportChangeListener) =>
      changeListeners.delete(listener),
  }));

  return {
    changeViewportMatch(matches: boolean) {
      changeListeners.forEach((listener) =>
        listener({ matches } as MediaQueryListEvent),
      );
    },
  };
}
