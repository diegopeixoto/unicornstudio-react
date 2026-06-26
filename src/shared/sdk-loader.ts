import { BUNDLED_UNICORN_SDK } from "./sdk-bundle";
import { UNICORN_STUDIO_MODEL_RENDERER_URL } from "./constants";

export interface BundledUnicornStudioImportMap {
  imports: Record<string, string>;
}

const SCRIPT_ERROR_MESSAGE = "Failed to load UnicornStudio script";
const MISSING_BUNDLED_SDK_MESSAGE =
  "Bundled Unicorn Studio SDK files are missing. Add vendor/unicornstudio/unicornStudio.umd.js and the two extension files in vendor/unicornstudio/extensions/, or pass sdkUrl to load the SDK from a custom URL.";

const externalScriptPromises = new Map<string, Promise<void>>();
let bundledScriptPromise: Promise<void> | null = null;

function createLoadError(message: string = SCRIPT_ERROR_MESSAGE): Error {
  return new Error(message);
}

function assertBrowserEnvironment() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw createLoadError(
      "UnicornStudio SDK can only be loaded in the browser",
    );
  }
}

function assertSdkAvailable() {
  if (!window.UnicornStudio?.addScene) {
    throw createLoadError("UnicornStudio global not found after script load");
  }
}

function getExternalScript(scriptUrl: string): HTMLScriptElement | null {
  return document.querySelector(`script[src="${scriptUrl}"]`);
}

function getBundledScript(id: string): HTMLScriptElement | null {
  return document.querySelector(`script[data-unicorn-sdk-id="${id}"]`);
}

function loadExternalScript(scriptUrl: string): Promise<void> {
  assertBrowserEnvironment();

  if (window.UnicornStudio?.addScene) {
    return Promise.resolve();
  }

  const existingScript = getExternalScript(scriptUrl);
  if (existingScript?.dataset.loaded === "true") {
    try {
      assertSdkAvailable();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(
        error instanceof Error ? error : createLoadError(scriptUrl),
      );
    }
  }

  const existingPromise = externalScriptPromises.get(scriptUrl);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = existingScript ?? document.createElement("script");

    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    const handleLoad = () => {
      cleanup();
      script.dataset.loaded = "true";

      try {
        assertSdkAvailable();
        resolve();
      } catch (error) {
        reject(error instanceof Error ? error : createLoadError());
      }
    };

    const handleError = () => {
      cleanup();
      reject(createLoadError());
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (!existingScript) {
      script.src = scriptUrl;
      script.async = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    externalScriptPromises.delete(scriptUrl);
    throw error;
  });

  externalScriptPromises.set(scriptUrl, promise);
  return promise;
}

function injectBundledCoreScript(content: string) {
  const existingScript = getBundledScript("core");
  if (existingScript?.dataset.loaded === "true") {
    return;
  }

  const script = existingScript ?? document.createElement("script");
  script.type = "text/javascript";
  script.dataset.unicornSdkId = "core";
  script.text = content;
  script.dataset.loaded = "true";

  if (!existingScript) {
    document.head.appendChild(script);
  }
}

function createModuleBlobUrl(content: string): string {
  const blob = new Blob([content], { type: "text/javascript" });
  return URL.createObjectURL(blob);
}

function rewriteModelRendererImport(
  modelRendererContent: string,
  threeBundleUrl: string,
): string {
  return modelRendererContent.replace(
    /from\s*["']\.\/three-bundle\.js["']/,
    `from "${threeBundleUrl}"`,
  );
}

function injectBundledExtensionImportMap(modelRendererUrl: string) {
  const existingScript = getBundledScript("import-map");
  if (existingScript) {
    return;
  }

  const script = document.createElement("script");
  script.type = "importmap";
  script.dataset.unicornSdkId = "import-map";
  script.textContent = JSON.stringify({
    imports: {
      [UNICORN_STUDIO_MODEL_RENDERER_URL]: modelRendererUrl,
    },
  } satisfies BundledUnicornStudioImportMap);
  document.head.appendChild(script);
}

function setupBundledExtensions(
  threeBundleContent: string,
  modelRendererContent: string,
) {
  const threeBundleUrl = createModuleBlobUrl(threeBundleContent);
  const modelRendererUrl = createModuleBlobUrl(
    rewriteModelRendererImport(modelRendererContent, threeBundleUrl),
  );

  injectBundledExtensionImportMap(modelRendererUrl);
}

function loadBundledSdk(): Promise<void> {
  assertBrowserEnvironment();

  if (window.UnicornStudio?.addScene) {
    return Promise.resolve();
  }

  if (bundledScriptPromise) {
    return bundledScriptPromise;
  }

  bundledScriptPromise = Promise.resolve()
    .then(() => {
      if (!BUNDLED_UNICORN_SDK.available) {
        throw createLoadError(MISSING_BUNDLED_SDK_MESSAGE);
      }

      const coreScript = BUNDLED_UNICORN_SDK.scripts.find(
        (script) => script.id === "core",
      );
      const threeBundleScript = BUNDLED_UNICORN_SDK.scripts.find(
        (script) => script.id === "three-bundle",
      );
      const modelRendererScript = BUNDLED_UNICORN_SDK.scripts.find(
        (script) => script.id === "model-renderer",
      );

      if (
        !coreScript?.content.trim() ||
        !threeBundleScript?.content.trim() ||
        !modelRendererScript?.content.trim()
      ) {
        throw createLoadError(MISSING_BUNDLED_SDK_MESSAGE);
      }

      setupBundledExtensions(
        threeBundleScript.content,
        modelRendererScript.content,
      );
      injectBundledCoreScript(coreScript.content);

      assertSdkAvailable();
    })
    .catch((error) => {
      bundledScriptPromise = null;
      throw error instanceof Error ? error : createLoadError();
    });

  return bundledScriptPromise;
}

export function loadUnicornStudioSdk(sdkUrl?: string): Promise<void> {
  return sdkUrl ? loadExternalScript(sdkUrl) : loadBundledSdk();
}
