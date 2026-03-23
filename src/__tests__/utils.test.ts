import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isWebGLSupported,
  validateFPS,
  validateScale,
  validateParameters,
} from "../shared/utils";

describe("isWebGLSupported", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true during SSR (no window)", () => {
    const windowSpy = vi.spyOn(globalThis, "window", "get");
    windowSpy.mockReturnValue(undefined as unknown as Window & typeof globalThis);
    expect(isWebGLSupported()).toBe(true);
  });

  it("returns true when WebGL is supported", () => {
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue({}),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement
    );
    expect(isWebGLSupported()).toBe(true);
    expect(mockCanvas.getContext).toHaveBeenCalledWith("webgl");
  });

  it("returns false when WebGL is not supported", () => {
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(null),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement
    );
    expect(isWebGLSupported()).toBe(false);
  });

  it("returns false when getContext throws", () => {
    const mockCanvas = {
      getContext: vi.fn().mockImplementation(() => {
        throw new Error("WebGL not available");
      }),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement
    );
    expect(isWebGLSupported()).toBe(false);
  });
});

describe("validateFPS", () => {
  it.each([15, 24, 30, 60, 120])("returns true for valid FPS %d", (fps) => {
    expect(validateFPS(fps)).toBe(true);
  });

  it.each([0, 1, 25, 45, 59, 90, 144])("returns false for invalid FPS %d", (fps) => {
    expect(validateFPS(fps)).toBe(false);
  });
});

describe("validateScale", () => {
  it.each([0.25, 0.5, 0.75, 1.0])("returns true for valid scale %d", (scale) => {
    expect(validateScale(scale)).toBe(true);
  });

  it.each([0, 0.1, 0.24, 1.01, 1.5, 2])("returns false for invalid scale %d", (scale) => {
    expect(validateScale(scale)).toBe(false);
  });
});

describe("validateParameters", () => {
  it("returns null when both parameters are valid", () => {
    expect(validateParameters(1, 60)).toBeNull();
    expect(validateParameters(0.25, 120)).toBeNull();
    expect(validateParameters(0.5, 30)).toBeNull();
  });

  it("returns error message for invalid scale", () => {
    const result = validateParameters(0.1, 60);
    expect(result).toContain("Invalid scale");
    expect(result).toContain("0.1");
  });

  it("returns error message for invalid fps", () => {
    const result = validateParameters(1, 45);
    expect(result).toContain("Invalid fps");
    expect(result).toContain("45");
  });

  it("returns scale error first when both are invalid", () => {
    const result = validateParameters(0.1, 45);
    expect(result).toContain("Invalid scale");
  });
});
