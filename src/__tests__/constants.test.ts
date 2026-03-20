import { describe, it, expect } from "vitest";
import {
  UNICORN_STUDIO_VERSION,
  UNICORN_STUDIO_CDN_URL,
  DEFAULT_VALUES,
  VALID_FPS,
} from "../shared/constants";

describe("constants", () => {
  it("CDN URL includes the version", () => {
    expect(UNICORN_STUDIO_CDN_URL).toContain(UNICORN_STUDIO_VERSION);
  });

  it("CDN URL points to jsdelivr", () => {
    expect(UNICORN_STUDIO_CDN_URL).toMatch(/^https:\/\/cdn\.jsdelivr\.net\//);
  });

  it("VALID_FPS contains expected values", () => {
    expect([...VALID_FPS]).toEqual([15, 24, 30, 60, 120]);
  });

  it("DEFAULT_VALUES has expected defaults", () => {
    expect(DEFAULT_VALUES.width).toBe("100%");
    expect(DEFAULT_VALUES.height).toBe("100%");
    expect(DEFAULT_VALUES.scale).toBe(1);
    expect(DEFAULT_VALUES.dpi).toBe(1.5);
    expect(DEFAULT_VALUES.fps).toBe(60);
    expect(DEFAULT_VALUES.altText).toBe("Scene");
    expect(DEFAULT_VALUES.lazyLoad).toBe(true);
    expect(DEFAULT_VALUES.production).toBe(true);
    expect(DEFAULT_VALUES.paused).toBe(false);
  });
});
