/**
 * Valid frames per second values supported by Unicorn Studio.
 *
 * @remarks
 * Lower values reduce CPU/GPU usage, higher values provide smoother animations.
 */
export type ValidFPS = 15 | 24 | 30 | 60 | 120;

/**
 * Scale range for rendering quality.
 *
 * @remarks
 * Value should be between 0.25 and 1.0. Lower values reduce quality but improve performance.
 */
export type ScaleRange = number;

/**
 * Props for the UnicornScene component.
 */
export interface UnicornSceneProps {
  /**
   * The Unicorn Studio project ID to load.
   *
   * @remarks
   * Either `projectId` or `jsonFilePath` must be provided.
   */
  projectId?: string;

  /**
   * Path to a local JSON file containing the scene data.
   *
   * @remarks
   * Either `projectId` or `jsonFilePath` must be provided.
   */
  jsonFilePath?: string;

  /**
   * Custom URL for the Unicorn Studio SDK script.
   *
   * @defaultValue The official Unicorn Studio CDN URL
   */
  sdkUrl?: string;

  /**
   * Alt text for accessibility and placeholder images.
   *
   * @defaultValue "Scene"
   */
  altText?: string;

  /**
   * Width of the scene container.
   *
   * @remarks
   * Can be a number (pixels) or CSS string value.
   *
   * @defaultValue "100%"
   */
  width?: number | string;

  /**
   * Height of the scene container.
   *
   * @remarks
   * Can be a number (pixels) or CSS string value.
   *
   * @defaultValue "100%"
   */
  height?: number | string;

  /**
   * Rendering scale factor (0.25 to 1.0).
   *
   * @remarks
   * Lower values reduce quality but improve performance.
   *
   * @defaultValue 1
   */
  scale?: ScaleRange;

  /**
   * Device pixel ratio for rendering.
   *
   * @defaultValue 1.5
   */
  dpi?: number;

  /**
   * Target frames per second for the animation.
   *
   * @defaultValue 60
   */
  fps?: ValidFPS;

  /**
   * ARIA label for the scene container.
   *
   * @remarks
   * Falls back to `altText` if not provided.
   */
  ariaLabel?: string;

  /**
   * CSS class name for the scene container.
   */
  className?: string;

  /**
   * Whether to lazy load the scene when it enters the viewport.
   *
   * @defaultValue true
   */
  lazyLoad?: boolean;

  /**
   * Whether to use production mode for the scene.
   *
   * @defaultValue true
   */
  production?: boolean;

  /**
   * Whether the scene animation is paused.
   *
   * @defaultValue false
   */
  paused?: boolean;

  /**
   * Placeholder content to display while loading or on error.
   *
   * @remarks
   * Can be an image URL string or a React node.
   */
  placeholder?: string | React.ReactNode;

  /**
   * CSS class name for a placeholder div element.
   *
   * @remarks
   * Only used when `placeholder` is not provided.
   */
  placeholderClassName?: string;

  /**
   * Whether to show the placeholder when an error occurs.
   *
   * @defaultValue true
   */
  showPlaceholderOnError?: boolean;

  /**
   * Whether to show the placeholder while the scene is loading.
   *
   * @defaultValue true
   */
  showPlaceholderWhileLoading?: boolean;

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
}

/**
 * Represents an initialized Unicorn Studio scene instance.
 */
export interface UnicornStudioScene {
  /**
   * The DOM element containing the scene.
   */
  element: HTMLElement;

  /**
   * Destroys the scene and cleans up resources.
   */
  destroy: () => void;

  /**
   * Triggers a resize of the scene to fit its container.
   */
  resize?: () => void;

  /**
   * Whether the scene animation is currently paused.
   */
  paused?: boolean;

  /**
   * Checks if the scene contains the given element.
   *
   * @param element - The element to check
   * @returns Whether the element is contained within the scene
   */
  contains?: (element: HTMLElement | null) => boolean;
}

/**
 * Configuration options for initializing a Unicorn Studio scene.
 */
export interface UnicornSceneConfig {
  /**
   * The ID of the DOM element to render the scene into.
   */
  elementId: string;

  /**
   * Rendering scale factor (0.25 to 1.0).
   */
  scale?: ScaleRange;

  /**
   * Device pixel ratio for rendering.
   */
  dpi?: number;

  /**
   * Target frames per second for the animation.
   */
  fps?: ValidFPS;

  /**
   * The Unicorn Studio project ID to load.
   */
  projectId?: string;

  /**
   * Path to a local JSON file containing the scene data.
   */
  filePath?: string;

  /**
   * Whether to lazy load the scene when it enters the viewport.
   */
  lazyLoad?: boolean;

  /**
   * Whether the scene position is fixed.
   */
  fixed?: boolean;

  /**
   * Alt text for accessibility.
   */
  altText?: string;

  /**
   * ARIA label for the scene.
   */
  ariaLabel?: string;

  /**
   * Whether to use production mode for the scene.
   */
  production?: boolean;

  /**
   * Interactivity configuration options.
   */
  interactivity?: {
    /**
     * Mouse interaction settings.
     */
    mouse?: {
      /**
       * Whether to disable mouse interactions on mobile devices.
       */
      disableMobile?: boolean;
    };
  };
}

/**
 * The Unicorn Studio global API interface.
 *
 * @remarks
 * This API is available on the `window.UnicornStudio` object after the SDK script loads.
 */
export interface UnicornStudioAPI {
  /**
   * Initializes the Unicorn Studio library with global configuration.
   *
   * @param config - The initialization configuration
   * @returns A promise that resolves with an array of initialized scenes
   */
  init: (config: {
    scale: ScaleRange;
    dpi: number;
  }) => Promise<UnicornStudioScene[]>;

  /**
   * Adds and initializes a new scene.
   *
   * @param config - The scene configuration
   * @returns A promise that resolves with the initialized scene
   */
  addScene: (config: UnicornSceneConfig) => Promise<UnicornStudioScene>;

  /**
   * Destroys all scenes and cleans up the library.
   */
  destroy: () => void;
}

/**
 * Global configuration for Unicorn Studio.
 */
export interface UnicornStudioConfig {
  /**
   * Rendering scale factor (0.25 to 1.0).
   */
  scale: ScaleRange;

  /**
   * Device pixel ratio for rendering.
   */
  dpi: number;

  /**
   * Target frames per second for animations.
   */
  fps: ValidFPS;
}

/**
 * Global type augmentation to add UnicornStudio to the Window interface.
 */
declare global {
  interface Window {
    /**
     * The Unicorn Studio global API.
     */
    UnicornStudio?: UnicornStudioAPI;
  }
}
