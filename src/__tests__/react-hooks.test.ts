import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUnicornStudioScript } from "../react/hooks";

describe("useUnicornStudioScript (React)", () => {
  beforeEach(() => {
    // Clear any existing test scripts
    document
      .querySelectorAll('script[src*="example.com"]')
      .forEach((el) => el.remove());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document
      .querySelectorAll('script[src*="example.com"]')
      .forEach((el) => el.remove());
  });

  it("starts with isLoaded false and no error", () => {
    const { result } = renderHook(() =>
      useUnicornStudioScript("https://cdn.example.com/sdk.js")
    );
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("creates a script element in the document head", () => {
    renderHook(() =>
      useUnicornStudioScript("https://cdn.example.com/sdk.js")
    );
    const script = document.querySelector(
      'script[src="https://cdn.example.com/sdk.js"]'
    );
    expect(script).toBeTruthy();
    expect(script?.getAttribute("src")).toBe("https://cdn.example.com/sdk.js");
  });

  it("sets isLoaded to true on script load event", async () => {
    const { result } = renderHook(() =>
      useUnicornStudioScript("https://cdn.example.com/sdk.js")
    );

    const script = document.querySelector(
      'script[src="https://cdn.example.com/sdk.js"]'
    ) as HTMLScriptElement;

    await act(async () => {
      script.dispatchEvent(new Event("load"));
    });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("sets error on script load failure", async () => {
    const { result } = renderHook(() =>
      useUnicornStudioScript("https://cdn.example.com/sdk.js")
    );

    const script = document.querySelector(
      'script[src="https://cdn.example.com/sdk.js"]'
    ) as HTMLScriptElement;

    await act(async () => {
      script.dispatchEvent(new Event("error"));
    });

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("Failed to load");
  });

  it("detects already-loaded script with data-loaded attribute", () => {
    // Pre-add a loaded script
    const existing = document.createElement("script");
    existing.src = "https://cdn.example.com/sdk.js";
    existing.setAttribute("data-loaded", "true");
    document.head.appendChild(existing);

    const { result } = renderHook(() =>
      useUnicornStudioScript("https://cdn.example.com/sdk.js")
    );

    expect(result.current.isLoaded).toBe(true);
  });

  it("provides handleScriptLoad and handleScriptError callbacks", () => {
    const { result } = renderHook(() =>
      useUnicornStudioScript("https://cdn.example.com/sdk.js")
    );
    expect(typeof result.current.handleScriptLoad).toBe("function");
    expect(typeof result.current.handleScriptError).toBe("function");
  });
});
