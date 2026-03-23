import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type {
  UnicornStudioScene,
  UnicornSceneConfig,
  ValidFPS,
  ScaleRange,
} from "./types";
import { validateParameters } from "./utils";

/**
 * Sanitizes error messages to avoid exposing internal URLs or sensitive details.
 */
function sanitizeErrorMessage(message: string): string {
  if (message.includes("404") || message.includes("Failed to fetch")) {
    return "Resource not found";
  }
  if (message.includes("Network") || message.includes("network")) {
    return "Network error occurred";
  }
  if (message.includes("timeout")) {
    return "Loading timeout";
  }
  // For all other errors, redact obvious URLs and file paths to avoid leaking internals.
  const urlPattern = /\bhttps?:\/\/[^\s)]+/gi;
  const filePathPattern = /\b(?:[A-Za-z]:\\|\/)[^\s)]+/g;

  let sanitized = message.replaceAll(urlPattern, "[redacted]");
  sanitized = sanitized.replaceAll(filePathPattern, "[redacted]");

  return sanitized;
}

/**
 * Builds the scene configuration object from the given parameters and DOM element.
 *
 * @throws If neither `jsonFilePath` nor `projectId` is provided
 */
function buildSceneConfig(
  element: HTMLDivElement,
  params: {
    jsonFilePath?: string;
    projectId?: string;
    scale: ScaleRange;
    dpi: number;
    fps: ValidFPS;
    lazyLoad: boolean;
    altText: string;
    ariaLabel: string;
    production?: boolean;
  },
): UnicornSceneConfig {
  const elementId =
    element.id || `unicorn-${Math.random().toString(36).slice(2, 11)}`;

  if (!element.id) {
    element.id = elementId;
  }

  const config: UnicornSceneConfig = {
    elementId,
    scale: params.scale,
    dpi: params.dpi,
    fps: params.fps,
    lazyLoad: params.lazyLoad,
    altText: params.altText,
    ariaLabel: params.ariaLabel,
    production: params.production,
  };

  if (params.jsonFilePath) {
    config.filePath = params.jsonFilePath;
  } else if (params.projectId) {
    config.projectId = params.projectId;
  } else {
    throw new Error("No project ID or JSON file path provided");
  }

  return config;
}

const INIT_TIMEOUT_MS = 15000;

/**
 * Wraps a promise with a timeout, rejecting if it doesn't resolve in time.
 * Ensures the timer is always cleaned up.
 */
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number = INIT_TIMEOUT_MS,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Scene initialization timeout")),
      ms,
    );
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

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
 * Synchronizes an external React ref (callback or object ref) with the given scene instance.
 *
 * @param ref - A React ref callback or mutable object ref to receive the scene instance; if `undefined`, no action is taken
 * @param value - The current `UnicornStudioScene` instance or `null` to clear the ref
 */
function assignSceneRef(
  ref: React.Ref<UnicornStudioScene | null> | undefined,
  value: UnicornStudioScene | null,
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
  const initializationKeyRef = useRef<string>("");
  const isInitializingRef = useRef(false);

  // Stable refs for callbacks and sceneRef so they never trigger re-initialization
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const sceneRefRef = useRef(sceneRef);
  const prevSceneRef = useRef(sceneRef);

  // Sync external sceneRef when the prop changes: null the old ref and
  // forward the current scene (if any) to the new one.
  if (sceneRef !== prevSceneRef.current) {
    assignSceneRef(prevSceneRef.current, null);
    sceneRefRef.current = sceneRef;
    prevSceneRef.current = sceneRef;
    assignSceneRef(sceneRef, internalSceneRef.current);
  }

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
        onErrorRef.current?.(error);
      } else {
        setInitError(null);
      }
    }
  }, [validationError]);

  const destroyScene = useCallback(() => {
    if (internalSceneRef.current?.destroy) {
      internalSceneRef.current.destroy();
      internalSceneRef.current = null;
      assignSceneRef(sceneRefRef.current, null);
    }
    isInitializingRef.current = false;
  }, []);

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

      // Update the initialization key
      initializationKeyRef.current = currentKey;

      try {
        destroyScene();

        // Set the flag after destroyScene() which unconditionally clears it
        isInitializingRef.current = true;

        if (!window.UnicornStudio?.addScene) {
          throw new Error("UnicornStudio.addScene not found");
        }

        const sceneConfig = buildSceneConfig(elementRef.current, {
          jsonFilePath,
          projectId,
          scale,
          dpi,
          fps,
          lazyLoad,
          altText,
          ariaLabel,
          production,
        });

        const scene = await withTimeout(
          window.UnicornStudio.addScene(sceneConfig),
        );

        // If the effect cleaned up while we were awaiting, destroy and bail
        if (ignore) {
          scene?.destroy();
          return;
        }

        if (scene) {
          internalSceneRef.current = scene;
          assignSceneRef(sceneRefRef.current, scene);
          setInitError(null);
          isInitializingRef.current = false;
          onLoadRef.current?.();
        } else {
          isInitializingRef.current = false;
          throw new Error("Failed to initialize scene");
        }
      } catch (error) {
        if (ignore) return;

        const err = error instanceof Error ? error : new Error("Unknown error");
        const sanitizedError = new Error(sanitizeErrorMessage(err.message));
        setInitError(sanitizedError);
        isInitializingRef.current = false;
        onErrorRef.current?.(sanitizedError);
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
    validationError,
  ]);

  // Sync paused state with scene
  useEffect(() => {
    if (internalSceneRef.current && paused !== undefined) {
      internalSceneRef.current.paused = paused;
    }
  }, [paused]);

  // Observe container resize and call scene.resize() so the canvas adapts
  useEffect(() => {
    const el = elementRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      internalSceneRef.current?.resize?.();
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [elementRef]);

  return { error: initError };
}
