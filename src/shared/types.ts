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
 * Vec2 value for vector variables.
 */
export interface UnicornVec2 {
  type: "Vec2";
  x: number;
  y: number;
}

/**
 * Vec3 value for vector variables.
 */
export interface UnicornVec3 {
  type: "Vec3";
  x: number;
  y: number;
  z: number;
}

/**
 * Value accepted by a Unicorn Studio scene variable.
 *
 * @remarks
 * Colors are hex strings (e.g. `#7c3aed`), textures are URL strings, and
 * vector variables use {@link UnicornVec2} / {@link UnicornVec3} objects.
 */
export type UnicornVariableValue =
  | number
  | boolean
  | string
  | UnicornVec2
  | UnicornVec3;

/**
 * A map of variable names to values, as accepted by `setVariables()` and
 * the `variables` prop.
 */
export type UnicornVariables = Record<string, UnicornVariableValue>;

/**
 * A variable definition authored and published with the scene.
 */
export interface UnicornVariableDefinition {
  id: string;
  name: string;
  type: string;
  defaultValue?: UnicornVariableValue;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    step?: number;
  };
}

/**
 * A binding connecting a variable to a layer target.
 */
export interface UnicornVariableBinding {
  layerId: string;
  kind: "prop" | "source" | "texture";
  target: string;
  enabled: boolean;
}

/**
 * A variable definition enriched with its current value and binding metadata,
 * as returned by `scene.getVariableManifest()`.
 */
export interface UnicornVariableManifestEntry extends UnicornVariableDefinition {
  currentValue?: UnicornVariableValue;
  bindingCount: number;
  bindings: UnicornVariableBinding[];
}

/**
 * An authored group of variable values published with the scene.
 */
export interface UnicornPreset {
  id: string;
  name: string;
  values?: UnicornVariables;
}

/**
 * Lightweight layer descriptor returned by `scene.getLayers()`.
 */
export interface UnicornLayerDescriptor {
  id: string;
  publicId?: string;
  name?: string;
  type?: string;
}

/**
 * Runtime layer object returned by `scene.getLayer()`.
 */
export interface UnicornLayer {
  hide: () => UnicornLayer;
  show: () => UnicornLayer;
}

/**
 * Callback invoked when a scene variable changes.
 *
 * @param name - The changed variable name
 * @param value - The value passed to `setVariable()`
 * @param values - Current variable values after the change
 */
export type UnicornVariableChangeCallback = (
  name: string,
  value: UnicornVariableValue,
  values: UnicornVariables,
) => void;

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
   * @remarks
   * When omitted, the package loads the bundled SDK files included with the
   * library.
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
   * Values for variables authored and published with the scene.
   *
   * @remarks
   * Applied as `initialVariables` when the scene is created, then synced to
   * the live scene via `setVariables()` whenever the values change — without
   * re-initializing the scene. Unknown names or invalid values are ignored by
   * the SDK with a console warning.
   */
  variables?: UnicornVariables;

  /**
   * Authored preset ID or name to apply to the scene.
   *
   * @remarks
   * Applied as `initialPreset` when the scene is created, then synced via
   * `setPreset()` whenever it changes. Presets are applied before
   * `variables`, so explicit variable values override the preset on load.
   */
  preset?: string;

  /**
   * Callback fired when a scene variable changes, including changes made
   * through this component's `variables` prop and imperative `setVariable()`
   * calls.
   */
  onVariableChange?: UnicornVariableChangeCallback;

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

  /**
   * Optional ref that receives the initialized Unicorn Studio scene instance.
   *
   * @remarks
   * This is set after the scene finishes initializing and cleared when the
   * scene is destroyed or re-initialized.
   */
  sceneRef?: React.Ref<UnicornStudioScene | null>;
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

  /**
   * Sets a single authored variable value.
   */
  setVariable?: (
    name: string,
    value: UnicornVariableValue,
  ) => UnicornStudioScene;

  /**
   * Sets multiple authored variable values at once.
   */
  setVariables?: (values: UnicornVariables) => UnicornStudioScene;

  /**
   * Returns the current value for a variable name.
   */
  getVariable?: (name: string) => UnicornVariableValue | undefined;

  /**
   * Returns all current variable values keyed by name.
   */
  getVariables?: () => UnicornVariables;

  /**
   * Returns a variable definition, or `null` if unknown.
   */
  getVariableDefinition?: (name: string) => UnicornVariableDefinition | null;

  /**
   * Returns all variable definitions published with the scene.
   */
  getVariableDefinitions?: () => UnicornVariableDefinition[];

  /**
   * Returns variable definitions with current values and binding metadata.
   */
  getVariableManifest?: () => UnicornVariableManifestEntry[];

  /**
   * Subscribes to variable changes.
   *
   * @returns An unsubscribe function
   */
  onVariableChange?: (callback: UnicornVariableChangeCallback) => () => void;

  /**
   * Returns all authored presets published with the scene.
   */
  getPresets?: () => UnicornPreset[];

  /**
   * Returns a preset by ID or name, or `null` if unknown.
   */
  getPreset?: (idOrName: string) => UnicornPreset | null;

  /**
   * Applies an authored preset by ID or name.
   */
  setPreset?: (idOrName: string) => UnicornStudioScene;

  /**
   * Applies a runtime override to a layer property.
   *
   * @remarks
   * Prefer authored variables when they exist for the same value.
   */
  setProp?: (
    layerIdOrName: string,
    prop: string,
    value: unknown,
  ) => UnicornStudioScene;

  /**
   * Replaces a named shader sampler on a layer.
   */
  setTexture?: (
    layerIdOrName: string,
    samplerName: string,
    value: string | object,
  ) => UnicornStudioScene;

  /**
   * Returns lightweight layer descriptors for the scene.
   */
  getLayers?: () => UnicornLayerDescriptor[];

  /**
   * Returns the runtime layer object for a layer ID or name, or `null`.
   */
  getLayer?: (idOrName: string) => UnicornLayer | null;

  /**
   * Returns the latest scene-level pointer position.
   */
  getMouse?: () => { x: number; y: number; inBounds: boolean; moved: boolean };
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
   * Initial variable values applied after the scene loads its authored
   * defaults (and after `initialPreset`).
   */
  initialVariables?: UnicornVariables;

  /**
   * Authored preset ID or name applied on load, before `initialVariables`.
   */
  initialPreset?: string;

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
