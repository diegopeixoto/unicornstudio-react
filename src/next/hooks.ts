import { useState, useCallback, useEffect } from "react";

/**
 * Hook for managing the Unicorn Studio SDK script state in Next.js applications.
 *
 * @remarks
 * This hook is designed to work with Next.js's `Script` component.
 * Unlike the React version, it doesn't load the script itself - instead it provides
 * callbacks (`handleScriptLoad` and `handleScriptError`) to be passed to the
 * Next.js `Script` component's `onLoad` and `onError` props.
 *
 * The hook also checks if `window.UnicornStudio` is already available on mount,
 * handling cases where the script was loaded by a previous page navigation.
 *
 * @returns An object containing loading state, error state, and event handlers
 *
 * @example
 * ```tsx
 * import Script from "next/script";
 *
 * function MyComponent() {
 *   const { isLoaded, error, handleScriptLoad, handleScriptError } = useUnicornStudioScript();
 *
 *   return (
 *     <>
 *       <Script
 *         src="https://cdn.jsdelivr.net/..."
 *         onLoad={handleScriptLoad}
 *         onError={handleScriptError}
 *       />
 *       {isLoaded && <div>SDK Ready!</div>}
 *     </>
 *   );
 * }
 * ```
 */
export function useUnicornStudioScript(): {
  /** Whether the script has finished loading successfully */
  isLoaded: boolean;
  /** Error that occurred during script loading, if any */
  error: Error | null;
  /** Callback to pass to Script component's onLoad prop */
  handleScriptLoad: () => void;
  /** Callback to pass to Script component's onError prop */
  handleScriptError: () => void;
} {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleScriptLoad = useCallback(() => {
    // Only set to true if not already true to prevent duplicate triggers
    setIsLoaded(prev => {
      if (!prev && typeof window !== 'undefined' && (window as any).UnicornStudio) {
        setError(null);
        return true;
      }
      return prev;
    });
  }, []);

  const handleScriptError = useCallback(() => {
    setError(new Error("Failed to load UnicornStudio script"));
    setIsLoaded(false);
  }, []);

  // Check if UnicornStudio is already available on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).UnicornStudio && !isLoaded) {
      setIsLoaded(true);
      setError(null);
    }
  }, [isLoaded]);

  return { isLoaded, error, handleScriptLoad, handleScriptError };
}

// Re-export shared hooks
export { useUnicornScene } from "../shared/hooks";
export type { UseUnicornSceneParams } from "../shared/hooks";
