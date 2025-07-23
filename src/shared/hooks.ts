import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type {
  UnicornStudioScene,
  UnicornSceneConfig,
  ValidFPS,
  ScaleRange,
} from "./types";
import { validateParameters } from "./utils";

// Custom hook for scene management
export interface UseUnicornSceneParams {
  elementRef: React.RefObject<HTMLDivElement | null>;
  projectId?: string;
  jsonFilePath?: string;
  production?: boolean;
  scale: ScaleRange;
  dpi: number;
  fps: ValidFPS;
  lazyLoad: boolean;
  altText: string;
  ariaLabel: string;
  isScriptLoaded: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * React hook for initializing, validating, and managing the lifecycle of a Unicorn Studio scene within a component.
 *
 * Handles scene creation, cleanup, parameter validation, error reporting, and supports both project ID and JSON file sources. Automatically manages scene re-initialization on configuration changes and provides error feedback via callback and return value.
 *
 * @returns An object containing the current initialization error, if any, as `error`.
 */
export function useUnicornScene({
  elementRef,
  projectId,
  jsonFilePath,
  production,
  scale,
  dpi,
  fps,
  lazyLoad,
  altText,
  ariaLabel,
  isScriptLoaded,
  onLoad,
  onError,
}: UseUnicornSceneParams) {
  const sceneRef = useRef<UnicornStudioScene | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);
  const hasAttemptedRef = useRef(false);
  const initializationKeyRef = useRef<string>("");

  // Validate parameters early and memoize the result to prevent loops
  const validationError = useMemo(() => {
    return validateParameters(scale, fps);
  }, [scale, fps]);

  const prevValidationError = useRef<string | null>(null);

  useEffect(() => {
    if (validationError !== prevValidationError.current) {
      prevValidationError.current = validationError;

      if (validationError) {
        const error = new Error(validationError);
        setInitError(error);
        onError?.(error);
      } else {
        setInitError(null);
      }
    }
  }, [validationError, onError]);

  const destroyScene = useCallback(() => {
    if (sceneRef.current?.destroy) {
      sceneRef.current.destroy();
      sceneRef.current = null;
    }
  }, []);

  const initializeScene = useCallback(async () => {
    if (!elementRef.current || !isScriptLoaded || validationError) return;

    // Create a unique key for this configuration
    const currentKey = `${projectId || ""}-${jsonFilePath || ""}-${scale}-${dpi}-${fps}-${production ? "prod" : "dev"}`;

    // If we've already attempted with this key and failed, don't retry
    if (
      initializationKeyRef.current === currentKey &&
      hasAttemptedRef.current &&
      initError
    ) {
      return;
    }

    // Update the initialization key
    initializationKeyRef.current = currentKey;
    hasAttemptedRef.current = true;

    try {
      destroyScene();

      // Check if UnicornStudio is available
      if (!window.UnicornStudio?.addScene) {
        throw new Error("UnicornStudio.addScene not found");
      }

      // Prepare scene configuration
      const sceneConfig: UnicornSceneConfig = {
        elementId:
          elementRef.current.id ||
          `unicorn-${Math.random().toString(36).slice(2, 11)}`,
        scale,
        dpi,
        fps,
        lazyLoad,
        altText,
        ariaLabel,
        production,
      };

      // Set the ID if it doesn't exist
      if (!elementRef.current.id) {
        elementRef.current.id = sceneConfig.elementId;
      }

      // Add project source
      if (jsonFilePath) {
        sceneConfig.filePath = jsonFilePath;
      } else if (projectId) {
        sceneConfig.projectId = projectId;
      } else {
        throw new Error("No project ID or JSON file path provided");
      }

      // Initialize the scene using the dynamic method with a timeout
      // This prevents infinite retries from the Unicorn Studio library
      let timeoutId: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Scene initialization timeout")),
          15000
        );
      });

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };

      try {
        const scene = await Promise.race([
          window.UnicornStudio.addScene(sceneConfig),
          timeoutPromise,
        ]);

        cleanup();

        if (scene) {
          sceneRef.current = scene;
          hasAttemptedRef.current = false; // Reset on success
          setInitError(null); // Clear any previous errors
          onLoad?.();
        } else {
          throw new Error("Failed to initialize scene");
        }
      } catch (error) {
        cleanup();
        throw error;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");

      // Sanitize error messages to not expose URLs
      let sanitizedMessage = err.message;
      if (
        sanitizedMessage.includes("404") ||
        sanitizedMessage.includes("Failed to fetch")
      ) {
        sanitizedMessage = "Resource not found";
      } else if (
        sanitizedMessage.includes("Network") ||
        sanitizedMessage.includes("network")
      ) {
        sanitizedMessage = "Network error occurred";
      } else if (sanitizedMessage.includes("timeout")) {
        sanitizedMessage = "Loading timeout";
      }

      const sanitizedError = new Error(sanitizedMessage);
      setInitError(sanitizedError);
      onError?.(sanitizedError);
    }
  }, [
    elementRef,
    isScriptLoaded,
    jsonFilePath,
    projectId,
    production,
    scale,
    dpi,
    fps,
    lazyLoad,
    altText,
    ariaLabel,
    destroyScene,
    onLoad,
    onError,
    validationError,
    initError,
  ]);

  useEffect(() => {
    if (isScriptLoaded) {
      void initializeScene();
    }

    return destroyScene;
  }, [isScriptLoaded, initializeScene, destroyScene]);

  // Reset state when projectId or jsonFilePath changes
  useEffect(() => {
    const newKey = `${projectId || ""}-${jsonFilePath || ""}-${scale}-${dpi}-${fps}-${production ? "prod" : "dev"}`;
    if (initializationKeyRef.current !== newKey) {
      hasAttemptedRef.current = false;
      setInitError(null);
    }
  }, [projectId, jsonFilePath, scale, dpi, fps, production]);

  return { error: initError };
}
