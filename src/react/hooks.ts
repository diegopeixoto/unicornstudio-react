import { useEffect, useState, useCallback } from "react";

/**
 * Hook for loading the Unicorn Studio SDK script in React applications.
 *
 * @remarks
 * This hook manages the lifecycle of the Unicorn Studio SDK script element.
 * It handles script loading, error states, and prevents duplicate script tags.
 * The script is loaded asynchronously and persists in the DOM to avoid re-loading on remount.
 *
 * @param scriptUrl - The URL of the Unicorn Studio SDK script to load
 * @returns An object containing loading state, error state, and event handlers
 *
 * @example
 * ```tsx
 * const { isLoaded, error } = useUnicornStudioScript(
 *   "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.1/dist/unicornStudio.umd.js"
 * );
 *
 * if (error) {
 *   return <div>Failed to load SDK</div>;
 * }
 *
 * if (!isLoaded) {
 *   return <div>Loading...</div>;
 * }
 * ```
 */
export function useUnicornStudioScript(scriptUrl: string): {
  /** Whether the script has finished loading successfully */
  isLoaded: boolean;
  /** Error that occurred during script loading, if any */
  error: Error | null;
  /** Callback to handle successful script load */
  handleScriptLoad: () => void;
  /** Callback to handle script loading error */
  handleScriptError: () => void;
} {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleScriptLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleScriptError = useCallback(() => {
    setError(new Error("Failed to load UnicornStudio script"));
  }, []);

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector(
      `script[src="${scriptUrl}"]`
    ) as HTMLScriptElement;

    if (existingScript) {
      if (existingScript.getAttribute("data-loaded") === "true") {
        setIsLoaded(true);
        return;
      }

      // If script exists but not loaded, attach listeners
      existingScript.addEventListener("load", handleScriptLoad);
      existingScript.addEventListener("error", handleScriptError);

      return () => {
        existingScript.removeEventListener("load", handleScriptLoad);
        existingScript.removeEventListener("error", handleScriptError);
      };
    }

    // Create and load the script
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.addEventListener("load", () => {
      script.setAttribute("data-loaded", "true");
      handleScriptLoad();
    });
    script.addEventListener("error", handleScriptError);

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.removeEventListener("load", handleScriptLoad);
        script.removeEventListener("error", handleScriptError);
        // Don't remove script from DOM to avoid re-loading on remount
      }
    };
  }, [scriptUrl, handleScriptLoad, handleScriptError]);

  return { isLoaded, error, handleScriptLoad, handleScriptError };
}

// Re-export shared hooks
export { useUnicornScene } from "../shared/hooks";
export type { UseUnicornSceneParams } from "../shared/hooks";
