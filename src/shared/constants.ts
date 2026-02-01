import type { ValidFPS, ScaleRange } from "./types";

/**
 * Current version of the Unicorn Studio SDK being used.
 */
export const UNICORN_STUDIO_VERSION = "2.0.4";

/**
 * CDN URL for the Unicorn Studio SDK script.
 *
 * @remarks
 * This URL points to the official Unicorn Studio UMD bundle hosted on jsDelivr.
 */
export const UNICORN_STUDIO_CDN_URL = `https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v${UNICORN_STUDIO_VERSION}/dist/unicornStudio.umd.js`;

/**
 * Default values for UnicornScene component props.
 *
 * @remarks
 * These defaults are used when optional props are not provided to the component.
 */
export const DEFAULT_VALUES = {
  /** Default container width */
  width: "100%" as const,
  /** Default container height */
  height: "100%" as const,
  /** Default rendering scale (0.25 to 1.0) */
  scale: 1 as ScaleRange,
  /** Default production mode setting */
  production: true,
  /** Default device pixel ratio */
  dpi: 1.5,
  /** Default frames per second */
  fps: 60 as ValidFPS,
  /** Default alt text for accessibility */
  altText: "Scene",
  /** Default CSS class name */
  className: "",
  /** Default paused state */
  paused: false,
  /** Default lazy loading setting */
  lazyLoad: true,
  /** Default setting for showing placeholder on error */
  showPlaceholderOnError: true,
  /** Default setting for showing placeholder while loading */
  showPlaceholderWhileLoading: true,
} as const;

/**
 * Array of valid FPS values supported by Unicorn Studio.
 *
 * @remarks
 * Only these specific frame rates are supported: 15, 24, 30, 60, and 120.
 */
export const VALID_FPS = [15, 24, 30, 60, 120] as const;
