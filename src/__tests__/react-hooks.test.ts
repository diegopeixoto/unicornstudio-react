import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUnicornStudioScript } from "../react/hooks";

const mockLoadUnicornStudioSdk = vi.fn();

vi.mock("../shared/sdk-loader", () => ({
  loadUnicornStudioSdk: (...args: unknown[]) =>
    mockLoadUnicornStudioSdk(...args),
}));

describe("useUnicornStudioScript (React)", () => {
  beforeEach(() => {
    delete (window as Record<string, unknown>).UnicornStudio;
    mockLoadUnicornStudioSdk.mockReset();
    mockLoadUnicornStudioSdk.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as Record<string, unknown>).UnicornStudio;
  });

  it("starts with isLoaded false and no error", () => {
    const { result } = renderHook(() =>
      useUnicornStudioScript("https://cdn.example.com/sdk.js"),
    );
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("loads the bundled SDK when no custom URL is provided", () => {
    renderHook(() => useUnicornStudioScript());
    expect(mockLoadUnicornStudioSdk).toHaveBeenCalledWith(undefined);
  });

  it("passes custom sdkUrl to the loader", () => {
    renderHook(() => useUnicornStudioScript("https://cdn.example.com/sdk.js"));
    expect(mockLoadUnicornStudioSdk).toHaveBeenCalledWith(
      "https://cdn.example.com/sdk.js",
    );
  });

  it("sets isLoaded to true when the loader resolves", async () => {
    const { result } = renderHook(() => useUnicornStudioScript());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("sets error when the loader rejects", async () => {
    mockLoadUnicornStudioSdk.mockRejectedValueOnce(new Error("Load failed"));
    const { result } = renderHook(() => useUnicornStudioScript());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("Load failed");
  });

  it("detects UnicornStudio already available on mount", () => {
    (window as Record<string, unknown>).UnicornStudio = { addScene: vi.fn() };
    const { result } = renderHook(() => useUnicornStudioScript());

    expect(result.current.isLoaded).toBe(true);
    expect(mockLoadUnicornStudioSdk).not.toHaveBeenCalled();
  });

  it("provides handleScriptLoad and handleScriptError callbacks", () => {
    const { result } = renderHook(() =>
      useUnicornStudioScript("https://cdn.example.com/sdk.js"),
    );
    expect(typeof result.current.handleScriptLoad).toBe("function");
    expect(typeof result.current.handleScriptError).toBe("function");
  });
});
