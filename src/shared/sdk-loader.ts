import { BUNDLED_UNICORN_SDK } from "./sdk-bundle";

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

function injectBundledScript(id: string, content: string) {
  const existingScript = getBundledScript(id);
  if (existingScript?.dataset.loaded === "true") {
    return;
  }

  const script = existingScript ?? document.createElement("script");
  script.type = "text/javascript";
  script.dataset.unicornSdkId = id;
  script.text = content;
  script.dataset.loaded = "true";

  if (!existingScript) {
    document.head.appendChild(script);
  }
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

      for (const script of BUNDLED_UNICORN_SDK.scripts) {
        if (!script.content.trim()) {
          throw createLoadError(MISSING_BUNDLED_SDK_MESSAGE);
        }

        injectBundledScript(script.id, script.content);
      }

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
