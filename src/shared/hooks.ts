import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type {
  UnicornStudioScene,
  UnicornSceneConfig,
  ValidFPS,
  ScaleRange,
} from "./types";
import { validateParameters } from "./utils";

/**
 * Parameters for the useUnicornScene hook.
 */
export interface UseUnicornSceneParams {
  /**
   * React ref to the container element where the scene will be rendered.
   */
  elementRef: React.RefObject<HTMLDivElement | null>;

  /**
   * The Unicorn Studio project ID to load.
   */
  projectId?: string;

  /**
   * Path to a local JSON file containing the scene data.
   */
  jsonFilePath?: string;

  /**
   * Whether to use production mode for the scene.
   */
  production?: boolean;

  /**
   * Rendering scale factor (0.25 to 1.0).
   */
  scale: ScaleRange;

  /**
   * Device pixel ratio for rendering.
   */
  dpi: number;

  /**
   * Target frames per second for the animation.
   */
  fps: ValidFPS;

  /**
   * Whether to lazy load the scene when it enters the viewport.
   */
  lazyLoad: boolean;

  /**
   * Alt text for accessibility.
   */
  altText: string;

  /**
   * ARIA label for the scene container.
   */
  ariaLabel: string;

  /**
   * Whether the Unicorn Studio SDK script has finished loading.
   */
  isScriptLoaded: boolean;

  /**
   * Whether the scene animation is paused.
   */
  paused?: boolean;

  /**
   * Callback fired when the scene has loaded successfully.
   */
  onLoad?: () => void;

  /**
   * Callback fired when an error occurs during scene loading.
   *
   * @param error - The error that occurred
   */
  onError?: (error: Error) => void;

  /**
   * Optional ref that receives the active Unicorn Studio scene instance.
   */
  sceneRef?: React.Ref<UnicornStudioScene | null>;
}

/**
 * Keeps an external ref in sync with the current scene instance.
 */
function assignSceneRef(
  ref: React.Ref<UnicornStudioScene | null> | undefined,
  value: UnicornStudioScene | null
) {
  if (!ref) return;

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as React.MutableRefObject<UnicornStudioScene | null>).current = value;
}

/**
 * Hook for managing a Unicorn Studio scene lifecycle.
 *
 * @remarks
 * This hook handles scene initialization, configuration updates, pause state synchronization,
 * and cleanup. It is framework-agnostic and used internally by both React and Next.js components.
 *
 * The hook will automatically:
 * - Initialize the scene when the SDK script loads
 * - Re-initialize when configuration changes
 * - Sync the paused state with the scene
 * - Clean up resources on unmount
 *
 * @param params - The hook parameters
 * @returns An object containing any initialization error
 *
 * @example
 * ```tsx
 * const { error } = useUnicornScene({
 *   elementRef,
 *   projectId: "my-project-id",
 *   scale: 1,
 *   dpi: 1.5,
 *   fps: 60,
 *   lazyLoad: true,
 *   altText: "My Scene",
 *   ariaLabel: "Interactive animation",
 *   isScriptLoaded: true,
 *   onLoad: () => console.log("Scene loaded!"),
 *   onError: (err) => console.error(err),
 * });
 * ```
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
  paused,
  onLoad,
  onError,
  sceneRef,
}: UseUnicornSceneParams): { error: Error | null } {
  const internalSceneRef = useRef<UnicornStudioScene | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);
  const hasAttemptedRef = useRef(false);
  const initializationKeyRef = useRef<string>("");
  const isInitializingRef = useRef(false);

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
    if (internalSceneRef.current?.destroy) {
      internalSceneRef.current.destroy();
      internalSceneRef.current = null;
      assignSceneRef(sceneRef, null);
    }
    isInitializingRef.current = false;
  }, [sceneRef]);

  useEffect(() => {
    let ignore = false;

    async function initializeScene() {
      if (!elementRef.current || !isScriptLoaded || validationError) return;

      // Prevent multiple concurrent initializations
      if (isInitializingRef.current) return;

      // Create a unique key for this configuration
      const currentKey = `${projectId || ""}-${jsonFilePath || ""}-${scale}-${dpi}-${fps}-${production ? "prod" : "dev"}`;

      // Check if we're already initialized with this exact configuration
      if (
        initializationKeyRef.current === currentKey &&
        internalSceneRef.current
      ) {
        return;
      }

      // Update the initialization key and flag
      initializationKeyRef.current = currentKey;
      hasAttemptedRef.current = true;
      isInitializingRef.current = true;

      try {
        destroyScene();

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

        if (!elementRef.current.id) {
          elementRef.current.id = sceneConfig.elementId;
        }

        if (jsonFilePath) {
          sceneConfig.filePath = jsonFilePath;
        } else if (projectId) {
          sceneConfig.projectId = projectId;
        } else {
          throw new Error("No project ID or JSON file path provided");
        }

        // Initialize with a timeout to prevent infinite retries
        let timeoutId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("Scene initialization timeout")),
            15000
          );
        });

        const clearTimer = () => {
          if (timeoutId) clearTimeout(timeoutId);
        };

        try {
          const scene = await Promise.race([
            window.UnicornStudio.addScene(sceneConfig),
            timeoutPromise,
          ]);

          clearTimer();

          // If the effect cleaned up while we were awaiting, destroy and bail
          if (ignore) {
            scene?.destroy();
            return;
          }

          if (scene) {
            internalSceneRef.current = scene;
            assignSceneRef(sceneRef, scene);
            hasAttemptedRef.current = false;
            setInitError(null);
            isInitializingRef.current = false;
            onLoad?.();
          } else {
            isInitializingRef.current = false;
            throw new Error("Failed to initialize scene");
          }
        } catch (error) {
          clearTimer();
          throw error;
        }
      } catch (error) {
        if (ignore) return;

        const err =
          error instanceof Error ? error : new Error("Unknown error");

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
        isInitializingRef.current = false;
        onError?.(sanitizedError);
      }
    }

    if (isScriptLoaded) {
      void initializeScene();
    }

    return () => {
      ignore = true;
      destroyScene();
    };
  }, [
    isScriptLoaded,
    elementRef,
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
    sceneRef,
    validationError,
  ]);

  // Sync paused state with scene
  useEffect(() => {
    if (internalSceneRef.current && paused !== undefined) {
      internalSceneRef.current.paused = paused;
    }
  }, [paused]);

  return { error: initError };
}
