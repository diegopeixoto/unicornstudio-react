export type ValidFPS = 15 | 24 | 30 | 60 | 120;

export type ScaleRange = number;

// UnicornScene component types
export interface UnicornSceneProps {
  projectId?: string;
  jsonFilePath?: string;
  sdkUrl?: string;
  altText?: string;
  width?: number | string;
  height?: number | string;
  scale?: ScaleRange;
  dpi?: number;
  fps?: ValidFPS;
  ariaLabel?: string;
  className?: string;
  lazyLoad?: boolean;
  production?: boolean;
  placeholder?: string | React.ReactNode;
  placeholderClassName?: string;
  showPlaceholderOnError?: boolean;
  showPlaceholderWhileLoading?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface UnicornStudioScene {
  element: HTMLElement;
  destroy: () => void;
  resize?: () => void;
  paused?: boolean;
  contains?: (element: HTMLElement | null) => boolean;
}

export interface UnicornSceneConfig {
  elementId: string;
  scale?: ScaleRange;
  dpi?: number;
  fps?: ValidFPS;
  projectId?: string;
  filePath?: string;
  lazyLoad?: boolean;
  fixed?: boolean;
  altText?: string;
  ariaLabel?: string;
  production?: boolean;
  interactivity?: {
    mouse?: {
      disableMobile?: boolean;
    };
  };
}

export interface UnicornStudioAPI {
  init: (config: {
    scale: ScaleRange;
    dpi: number;
  }) => Promise<UnicornStudioScene[]>;
  addScene: (config: UnicornSceneConfig) => Promise<UnicornStudioScene>;
  destroy: () => void;
}

export interface UnicornStudioConfig {
  scale: ScaleRange;
  dpi: number;
  fps: ValidFPS;
}

// Global type augmentation
declare global {
  interface Window {
    UnicornStudio?: UnicornStudioAPI;
  }
}
