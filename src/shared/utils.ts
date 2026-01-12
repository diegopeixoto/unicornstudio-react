import { VALID_FPS } from "./constants";
import type { ScaleRange, ValidFPS } from "./types";

/**
 * Checks if WebGL is supported in the current browser environment.
 *
 * @remarks
 * During server-side rendering (SSR), this function returns `true` to assume
 * WebGL support until client-side hydration can verify.
 *
 * @returns `true` if WebGL is supported or during SSR, `false` otherwise
 *
 * @example
 * ```tsx
 * if (!isWebGLSupported()) {
 *   return <FallbackContent />;
 * }
 * ```
 */
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return true; // Assume supported during SSR

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch (e) {
    return false;
  }
}

/**
 * Validates if the given FPS value is one of the allowed values.
 *
 * @param fps - The frames per second value to validate
 * @returns `true` if the FPS value is valid (15, 24, 30, 60, or 120)
 *
 * @example
 * ```ts
 * validateFPS(60);  // true
 * validateFPS(45);  // false
 * ```
 */
export function validateFPS(fps: number): fps is ValidFPS {
  return VALID_FPS.includes(fps as ValidFPS);
}

/**
 * Validates if the given scale value is within the allowed range.
 *
 * @param scale - The scale value to validate
 * @returns `true` if the scale is between 0.25 and 1.0 (inclusive)
 *
 * @example
 * ```ts
 * validateScale(1);     // true
 * validateScale(0.5);   // true
 * validateScale(0.1);   // false
 * validateScale(1.5);   // false
 * ```
 */
export function validateScale(scale: number): scale is ScaleRange {
  return scale >= 0.25 && scale <= 1.0;
}

/**
 * Validates both scale and FPS parameters and returns an error message if invalid.
 *
 * @param scale - The scale value to validate (must be between 0.25 and 1.0)
 * @param fps - The frames per second value to validate (must be 15, 24, 30, 60, or 120)
 * @returns An error message string if validation fails, or `null` if both parameters are valid
 *
 * @example
 * ```ts
 * validateParameters(1, 60);    // null (valid)
 * validateParameters(0.1, 60);  // "Invalid scale: 0.1. Scale must be between 0.25 and 1.0"
 * validateParameters(1, 45);    // "Invalid fps: 45. FPS must be one of: 15, 24, 30, 60, 120"
 * ```
 */
export function validateParameters(scale: number, fps: number): string | null {
  if (!validateScale(scale)) {
    return `Invalid scale: ${scale}. Scale must be between 0.25 and 1.0`;
  }
  if (!validateFPS(fps)) {
    return `Invalid fps: ${fps}. FPS must be one of: 15, 24, 30, 60, 120`;
  }
  return null;
}
