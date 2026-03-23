import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom does not provide ResizeObserver — provide a minimal mock that tracks
// observed elements and exposes a helper to simulate resize entries.
type ResizeCallback = (entries: ResizeObserverEntry[]) => void;

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];

  callback: ResizeCallback;
  elements: Set<Element> = new Set();

  constructor(callback: ResizeCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe(target: Element) {
    this.elements.add(target);
  }
  unobserve(target: Element) {
    this.elements.delete(target);
  }
  disconnect = vi.fn(() => {
    this.elements.clear();
  });

  /** Test helper: fire the callback with a minimal entry for `target`. */
  simulateResize(target: Element) {
    const entry = { target } as ResizeObserverEntry;
    this.callback([entry]);
  }
}

vi.stubGlobal("ResizeObserver", MockResizeObserver);

export { MockResizeObserver };
