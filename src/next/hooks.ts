import { useState, useCallback, useEffect } from "react";
import { loadUnicornStudioSdk } from "../shared/sdk-loader";

/**
 * Hook for loading the Unicorn Studio SDK in Next.js applications.
 *
 * @remarks
 * This hook loads the bundled Unicorn Studio SDK by default. When `scriptUrl`
 * is provided, it loads that URL instead. The returned callbacks are preserved
 * for compatibility, but the hook manages script loading on its own.
 *
 * @param scriptUrl - Optional custom URL for the Unicorn Studio SDK script
 * @returns An object containing loading state, error state, and event handlers
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isLoaded, error } = useUnicornStudioScript();
 *
 *   return (
 *     isLoaded ? <div>SDK Ready!</div> : <div>Loading...</div>
 *   );
 * }
 * ```
 */
export function useUnicornStudioScript(scriptUrl?: string): {
  /** Whether the script has finished loading successfully */
  isLoaded: boolean;
  /** Error that occurred during script loading, if any */
  error: Error | null;
  /** Compatibility callback to mark the SDK as loaded */
  handleScriptLoad: () => void;
  /** Compatibility callback to record a load failure */
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
    setIsLoaded(false);
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
