import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { UnicornStudioAPI } from "../shared/types";
import type { BundledUnicornStudioSdk } from "../shared/sdk-bundle";
import type { BundledUnicornStudioImportMap } from "../shared/sdk-loader";
import { UNICORN_STUDIO_MODEL_RENDERER_URL } from "../shared/constants";

const { mockBundledSdk } = vi.hoisted(() => {
  const sdk: BundledUnicornStudioSdk = {
    available: true,
    scripts: [
      {
        id: "core",
        relativePath: "unicornStudio.umd.js",
        content: "window.UnicornStudio = { addScene: () => {} };",
      },
      {
        id: "model-renderer",
        relativePath: "extensions/model-renderer.js",
        content: 'import { THREE } from "./three-bundle.js";\nexport { draw };',
      },
      {
        id: "three-bundle",
        relativePath: "extensions/three-bundle.js",
        content: "export { THREE };",
      },
    ],
  };

  return { mockBundledSdk: sdk };
});

vi.mock("../shared/sdk-bundle", () => ({
  BUNDLED_UNICORN_SDK: mockBundledSdk,
}));

async function loadBundledSdk() {
  const { loadUnicornStudioSdk } = await import("../shared/sdk-loader");
  return loadUnicornStudioSdk();
}

function createMockUnicornStudio(
  overrides: Partial<UnicornStudioAPI> = {},
): UnicornStudioAPI {
  return {
    init: vi.fn().mockResolvedValue([]),
    addScene: vi.fn(),
    destroy: vi.fn(),
    ...overrides,
  };
}

function clearUnicornStudio() {
  delete window.UnicornStudio;
}

describe("loadUnicornStudioSdk", () => {
  beforeEach(async () => {
    vi.resetModules();
    clearUnicornStudio();
    document.head.innerHTML = "";
    mockBundledSdk.available = true;
    vi.spyOn(URL, "createObjectURL").mockImplementation(
      (blob) => `blob:mock-${(blob as Blob).size}`,
    );

    const originalAppendChild = HTMLElement.prototype.appendChild;
    vi.spyOn(document.head, "appendChild").mockImplementation(function (
      this: HTMLHeadElement,
      node,
    ) {
      const script = node as HTMLScriptElement;
      if (
        script.tagName === "SCRIPT" &&
        script.text &&
        script.type === "text/javascript"
      ) {
        // jsdom does not execute inline scripts, so simulate browser behavior.
        // eslint-disable-next-line no-new-func
        new Function(script.text)();
      }
      return originalAppendChild.call(this, node);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearUnicornStudio();
    document.head.innerHTML = "";
  });

  it("loads the bundled core script without injecting ESM extensions inline", async () => {
    await loadBundledSdk();

    const scripts = Array.from(
      document.head.querySelectorAll("script[data-unicorn-sdk-id]"),
    );

    expect(scripts).toHaveLength(2);
    expect(
      document.querySelector('script[data-unicorn-sdk-id="core"]')?.textContent,
    ).toContain("window.UnicornStudio");
    expect(
      document.querySelector('script[data-unicorn-sdk-id="model-renderer"]'),
    ).toBeNull();
    expect(
      document.querySelector('script[data-unicorn-sdk-id="three-bundle"]'),
    ).toBeNull();
    expect(window.UnicornStudio?.addScene).toBeTypeOf("function");
  });

  it("registers an import map that redirects the model-renderer CDN URL", async () => {
    await loadBundledSdk();

    const importMap = document.querySelector(
      'script[data-unicorn-sdk-id="import-map"]',
    );

    expect(importMap?.getAttribute("type")).toBe("importmap");
    const importMapData = JSON.parse(
      importMap?.textContent ?? "{}",
    ) as BundledUnicornStudioImportMap;

    expect(importMapData.imports[UNICORN_STUDIO_MODEL_RENDERER_URL]).toMatch(
      /^blob:mock-/,
    );
    expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
  });

  it("loads external scripts by URL when sdkUrl is provided", async () => {
    const { loadUnicornStudioSdk } = await import("../shared/sdk-loader");

    const scriptLoadPromise = new Promise<void>((resolve) => {
      const observer = new MutationObserver(() => {
        const script = document.querySelector(
          'script[src="https://cdn.example.com/sdk.js"]',
        ) as HTMLScriptElement | null;

        if (!script) return;

        observer.disconnect();
        window.UnicornStudio = createMockUnicornStudio();
        script.dataset.loaded = "true";
        script.dispatchEvent(new Event("load"));
        resolve();
      });

      observer.observe(document.head, { childList: true });
    });

    const loadPromise = loadUnicornStudioSdk("https://cdn.example.com/sdk.js");
    await scriptLoadPromise;
    await loadPromise;

    expect(
      document.querySelector('script[src="https://cdn.example.com/sdk.js"]'),
    ).not.toBeNull();
  });
});
