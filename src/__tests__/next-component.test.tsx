import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock Next.js modules
vi.mock("next/script", () => ({
  default: (props: Record<string, unknown>) => (
    <script data-testid="next-script" {...props} />
  ),
}));

vi.mock("next/image", () => ({
  default: ({ priority, fill, ...props }: Record<string, unknown>) => (
    <img
      data-testid="next-image"
      data-priority={priority ? "true" : undefined}
      data-fill={fill ? "true" : undefined}
      {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
    />
  ),
}));

// Mock hooks at the paths the Next.js component imports from
const mockUseUnicornStudioScript = vi.fn();
const mockUseUnicornScene = vi.fn();
const mockIsWebGLSupported = vi.fn();

vi.mock("../next/hooks", () => ({
  useUnicornStudioScript: (...args: unknown[]) =>
    mockUseUnicornStudioScript(...args),
  useUnicornScene: (...args: unknown[]) => mockUseUnicornScene(...args),
}));

vi.mock("../shared/utils", () => ({
  isWebGLSupported: () => mockIsWebGLSupported(),
  validateParameters: () => null,
}));

import { UnicornScene } from "../next";

beforeEach(() => {
  vi.clearAllMocks();
  mockUseUnicornStudioScript.mockReturnValue({
    isLoaded: false,
    error: null,
    handleScriptLoad: vi.fn(),
    handleScriptError: vi.fn(),
  });
  mockUseUnicornScene.mockReturnValue({ error: null });
  mockIsWebGLSupported.mockReturnValue(true);
});

describe("UnicornScene (Next.js)", () => {
  it("renders a container div and a Next.js Script", () => {
    const { container } = render(<UnicornScene projectId="test-id" />);
    expect(container.querySelector("div")).toBeTruthy();
    expect(screen.getByTestId("next-script")).toBeTruthy();
  });

  it("passes sdkUrl to the Script component", () => {
    render(<UnicornScene projectId="test-id" sdkUrl="https://custom-cdn.example.com/sdk.js" />);
    const script = screen.getByTestId("next-script");
    expect(script).toHaveAttribute("src", "https://custom-cdn.example.com/sdk.js");
  });

  it("uses lazyOnload strategy when lazyLoad is true", () => {
    render(<UnicornScene projectId="test-id" lazyLoad={true} />);
    const script = screen.getByTestId("next-script");
    expect(script).toHaveAttribute("strategy", "lazyOnload");
  });

  it("uses afterInteractive strategy when lazyLoad is false", () => {
    render(<UnicornScene projectId="test-id" lazyLoad={false} />);
    const script = screen.getByTestId("next-script");
    expect(script).toHaveAttribute("strategy", "afterInteractive");
  });

  it("applies custom className", () => {
    const { container } = render(
      <UnicornScene projectId="test-id" className="my-class" />,
    );
    // The container div is the second element (after the script)
    const divs = container.querySelectorAll("div");
    const sceneDiv = Array.from(divs).find((d) =>
      d.classList.contains("my-class"),
    );
    expect(sceneDiv).toBeTruthy();
  });

  it("sets CSS custom properties for dimensions", () => {
    const { container } = render(
      <UnicornScene projectId="test-id" width={800} height={600} />,
    );
    const divs = container.querySelectorAll("div");
    // Find the div with style custom properties
    const sceneDiv = Array.from(divs).find((d) =>
      d.style.getPropertyValue("--unicorn-width"),
    );
    expect(sceneDiv?.style.getPropertyValue("--unicorn-width")).toBe("800px");
    expect(sceneDiv?.style.getPropertyValue("--unicorn-height")).toBe("600px");
  });

  it("shows error when scene has error and no placeholder", () => {
    mockUseUnicornStudioScript.mockReturnValue({
      isLoaded: true,
      error: null,
      handleScriptLoad: vi.fn(),
      handleScriptError: vi.fn(),
    });
    mockUseUnicornScene.mockReturnValue({
      error: new Error("Scene failed"),
    });

    render(<UnicornScene projectId="test-id" />);
    expect(screen.getByText("Error loading scene")).toBeInTheDocument();
    expect(screen.getByText("Scene failed")).toBeInTheDocument();
  });

  it("shows script error", () => {
    mockUseUnicornStudioScript.mockReturnValue({
      isLoaded: false,
      error: new Error("Script load failed"),
      handleScriptLoad: vi.fn(),
      handleScriptError: vi.fn(),
    });
    mockUseUnicornScene.mockReturnValue({ error: null });

    render(<UnicornScene projectId="test-id" />);
    expect(screen.getByText("Error loading scene")).toBeInTheDocument();
    expect(screen.getByText("Script load failed")).toBeInTheDocument();
  });

  it("shows placeholder image with numeric dimensions using Next Image", () => {
    render(
      <UnicornScene
        projectId="test-id"
        placeholder="/loading.png"
        width={800}
        height={600}
        showPlaceholderWhileLoading={true}
      />,
    );
    const img = screen.getByTestId("next-image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/loading.png");
    expect(img).toHaveAttribute("width", "800");
    expect(img).toHaveAttribute("height", "600");
  });

  it("shows placeholder image with fill when using string dimensions", () => {
    render(
      <UnicornScene
        projectId="test-id"
        placeholder="/loading.png"
        width="100%"
        height="50vh"
        showPlaceholderWhileLoading={true}
      />,
    );
    const img = screen.getByTestId("next-image");
    expect(img).toBeInTheDocument();
    // fill prop should be set (no width/height attributes)
    expect(img).not.toHaveAttribute("width");
  });

  it("shows placeholderClassName div", () => {
    const { container } = render(
      <UnicornScene
        projectId="test-id"
        placeholderClassName="skeleton"
        showPlaceholderWhileLoading={true}
      />,
    );
    expect(container.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("shows custom React node as placeholder", () => {
    render(
      <UnicornScene
        projectId="test-id"
        placeholder={<span data-testid="custom">Loading...</span>}
        showPlaceholderWhileLoading={true}
      />,
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  it("hides error display when placeholder is present on error", () => {
    mockUseUnicornScene.mockReturnValue({
      error: new Error("Scene failed"),
    });

    render(
      <UnicornScene
        projectId="test-id"
        placeholder="/error.png"
        showPlaceholderOnError={true}
      />,
    );
    expect(screen.queryByText("Error loading scene")).not.toBeInTheDocument();
  });

  it("passes correct params to useUnicornScene", () => {
    mockUseUnicornStudioScript.mockReturnValue({
      isLoaded: true,
      error: null,
      handleScriptLoad: vi.fn(),
      handleScriptError: vi.fn(),
    });

    render(
      <UnicornScene
        projectId="my-project"
        scale={0.5}
        dpi={2}
        fps={30}
        lazyLoad={false}
        altText="My Scene"
        ariaLabel="Custom label"
        production={false}
        paused={true}
      />,
    );

    expect(mockUseUnicornScene).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "my-project",
        scale: 0.5,
        dpi: 2,
        fps: 30,
        lazyLoad: false,
        altText: "My Scene",
        ariaLabel: "Custom label",
        production: false,
        paused: true,
        isScriptLoaded: true,
      }),
    );
  });

  it("falls back ariaLabel to altText when not provided", () => {
    mockUseUnicornStudioScript.mockReturnValue({
      isLoaded: true,
      error: null,
      handleScriptLoad: vi.fn(),
      handleScriptError: vi.fn(),
    });

    render(<UnicornScene projectId="test-id" altText="My Alt" />);

    expect(mockUseUnicornScene).toHaveBeenCalledWith(
      expect.objectContaining({
        ariaLabel: "My Alt",
      }),
    );
  });
});
