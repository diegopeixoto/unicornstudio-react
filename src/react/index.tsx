import { useRef, useState, useEffect } from "react";
import type { UnicornSceneProps } from "../shared/types";
import { useUnicornStudioScript, useUnicornScene } from "./hooks";
import { UNICORN_STUDIO_CDN_URL, DEFAULT_VALUES } from "../shared/constants";
import { unicornStyles } from "../shared/styles";
import { isWebGLSupported } from "../shared/utils";

/**
 * React component for rendering Unicorn Studio WebGL animations.
 *
 * @remarks
 * This component wraps Unicorn Studio's WebGL animation system for use in React applications.
 * It handles script loading, scene initialization, placeholder display, and error states.
 *
 * The component requires either a `projectId` (to load from Unicorn Studio's servers)
 * or a `jsonFilePath` (to load from a local JSON file).
 *
 * @param props - The component props
 *
 * @example
 * Basic usage with project ID:
 * ```tsx
 * <UnicornScene
 *   projectId="your-project-id"
 *   width={800}
 *   height={600}
 * />
 * ```
 *
 * @example
 * With placeholder and callbacks:
 * ```tsx
 * <UnicornScene
 *   projectId="your-project-id"
 *   placeholder="/images/loading.png"
 *   onLoad={() => console.log("Scene loaded!")}
 *   onError={(err) => console.error(err)}
 * />
 * ```
 *
 * @example
 * Using local JSON file:
 * ```tsx
 * <UnicornScene
 *   jsonFilePath="/scenes/animation.json"
 *   scale={0.5}
 *   fps={30}
 * />
 * ```
 */
function UnicornScene({
  projectId,
  jsonFilePath,
  sdkUrl = UNICORN_STUDIO_CDN_URL,
  width = DEFAULT_VALUES.width,
  height = DEFAULT_VALUES.height,
  scale = DEFAULT_VALUES.scale,
  dpi = DEFAULT_VALUES.dpi,
  fps = DEFAULT_VALUES.fps,
  altText = DEFAULT_VALUES.altText,
  ariaLabel,
  className = DEFAULT_VALUES.className,
  lazyLoad = DEFAULT_VALUES.lazyLoad,
  production = DEFAULT_VALUES.production,
  paused = DEFAULT_VALUES.paused,
  placeholder,
  placeholderClassName,
  showPlaceholderOnError = DEFAULT_VALUES.showPlaceholderOnError,
  showPlaceholderWhileLoading = DEFAULT_VALUES.showPlaceholderWhileLoading,
  onLoad,
  onError,
}: UnicornSceneProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isSceneLoaded, setIsSceneLoaded] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  const {
    isLoaded,
    error: scriptError,
  } = useUnicornStudioScript(sdkUrl);

  const { error: sceneError } = useUnicornScene({
    elementRef,
    projectId,
    jsonFilePath,
    production,
    scale,
    dpi,
    fps,
    lazyLoad,
    altText,
    ariaLabel: ariaLabel || altText,
    isScriptLoaded: isLoaded,
    paused,
    onLoad: () => {
      setIsSceneLoaded(true);
      onLoad?.();
    },
    onError,
  });

  const error = scriptError || sceneError;

  // Check WebGL support on mount
  useEffect(() => {
    setWebGLSupported(isWebGLSupported());
  }, []);

  // Determine if placeholder should be shown
  const showPlaceholder =
    (placeholder || placeholderClassName) &&
    (!webGLSupported ||
      (showPlaceholderWhileLoading && !isSceneLoaded) ||
      (showPlaceholderOnError && error));

  // Calculate dimensions for both container and image
  const numericWidth = typeof width === "number" ? width : 0;
  const numericHeight = typeof height === "number" ? height : 0;
  const useNumericDimensions =
    typeof width === "number" && typeof height === "number";

  // Build CSS custom properties for dynamic dimensions
  const customProperties = {
    "--unicorn-width": typeof width === "number" ? `${width}px` : width,
    "--unicorn-height": typeof height === "number" ? `${height}px` : height,
  } as React.CSSProperties;

  return (
    <div
      ref={elementRef}
      style={{ ...unicornStyles.container, ...customProperties }}
      className={className}
    >
      {showPlaceholder && (placeholder || placeholderClassName) && (
        <div style={{ position: "absolute", inset: 0 }}>
          {typeof placeholder === "string" ? (
            <img
              src={placeholder}
              alt={altText}
              style={{
                width: useNumericDimensions ? `${numericWidth}px` : "100%",
                height: useNumericDimensions ? `${numericHeight}px` : "100%",
                objectFit: "cover",
              }}
            />
          ) : placeholder ? (
            placeholder
          ) : placeholderClassName ? (
            <div
              className={placeholderClassName}
              style={{ width: "100%", height: "100%" }}
              aria-label={altText}
            />
          ) : null}
        </div>
      )}
      {error && !showPlaceholder && (
        <div style={unicornStyles.errorWrapper}>
          <div style={unicornStyles.errorBox}>
            <p style={unicornStyles.errorTitle}>Error loading scene</p>
            <p style={unicornStyles.errorMessage}>{error.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnicornScene;
export { UnicornScene };

// Re-export types for convenience
export type { UnicornSceneProps } from "../shared/types";
