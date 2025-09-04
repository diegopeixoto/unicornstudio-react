import type { ValidFPS, ScaleRange } from "./types";

// UnicornStudio configuration constants
export const UNICORN_STUDIO_VERSION = "1.4.30";
export const UNICORN_STUDIO_CDN_URL = `https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v${UNICORN_STUDIO_VERSION}/dist/unicornStudio.umd.js`;

// Default values for UnicornScene props
export const DEFAULT_VALUES = {
  width: "100%" as const,
  height: "100%" as const,
  scale: 1 as ScaleRange, // 0.25 to 1.0
  production: true,
  dpi: 1.5,
  fps: 60 as ValidFPS, // 15, 24, 30, 60, or 120
  altText: "Scene",
  className: "",
  lazyLoad: true,
  showPlaceholderOnError: true,
  showPlaceholderWhileLoading: true,
} as const;

export const VALID_FPS = [15, 24, 30, 60, 120] as const;
