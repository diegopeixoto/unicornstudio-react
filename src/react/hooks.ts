import { useEffect, useState, useCallback } from "react";
import { loadUnicornStudioSdk } from "../shared/sdk-loader";

/**
 * Hook for loading the Unicorn Studio SDK in React applications.
 *
 * @remarks
 * This hook loads the bundled Unicorn Studio SDK by default. When `scriptUrl`
 * is provided, it loads that URL instead. Duplicate loads are deduplicated so
 * remounts or multiple scene instances reuse the same SDK instance.
 *
 * @param scriptUrl - Optional custom URL for the Unicorn Studio SDK script
 * @returns An object containing loading state, error state, and event handlers
 *
 * @example
 * ```tsx
 * const { isLoaded, error } = useUnicornStudioScript();
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
export function useUnicornStudioScript(scriptUrl?: string): {
  /** Whether the script has finished loading successfully */
  isLoaded: boolean;
  /** Error that occurred during script loading, if any */
  error: Error | null;
  /** Callback to handle successful script load */
  handleScriptLoad: () => void;
  /** Callback to handle script loading error */
  handleScriptError: () => void;
} {
  const [isLoaded, setIsLoaded] = useState(
    typeof window !== "undefined" && Boolean(window.UnicornStudio?.addScene),
  );
  const [error, setError] = useState<Error | null>(null);

  const handleScriptLoad = useCallback(() => {
    if (typeof window !== "undefined" && window.UnicornStudio?.addScene) {
      setIsLoaded(true);
      setError(null);
    }
  }, []);

  const handleScriptError = useCallback(() => {
    setError(new Error("Failed to load UnicornStudio script"));
  }, []);

  useEffect(() => {
    let ignore = false;

    if (typeof window !== "undefined" && window.UnicornStudio?.addScene) {
      setIsLoaded(true);
      setError(null);
      return;
    }

    void loadUnicornStudioSdk(scriptUrl)
      .then(() => {
        if (ignore) return;
        setIsLoaded(true);
        setError(null);
      })
      .catch((loadError) => {
        if (ignore) return;
        setIsLoaded(false);
        setError(
          loadError instanceof Error
            ? loadError
            : new Error("Failed to load UnicornStudio script"),
        );
      });

    return () => {
      ignore = true;
    };
  }, [scriptUrl]);

  return { isLoaded, error, handleScriptLoad, handleScriptError };
}

// Re-export shared hooks
export { useUnicornScene } from "../shared/hooks";
export type { UseUnicornSceneParams } from "../shared/hooks";
