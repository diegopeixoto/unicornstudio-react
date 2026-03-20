import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock hooks at the paths the component actually imports from
const mockUseUnicornStudioScript = vi.fn();
const mockUseUnicornScene = vi.fn();
const mockIsWebGLSupported = vi.fn();

vi.mock("../react/hooks", () => ({
  useUnicornStudioScript: (...args: unknown[]) =>
    mockUseUnicornStudioScript(...args),
  useUnicornScene: (...args: unknown[]) => mockUseUnicornScene(...args),
}));

vi.mock("../shared/utils", () => ({
  isWebGLSupported: () => mockIsWebGLSupported(),
}));

import { UnicornScene } from "../react";

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

describe("UnicornScene (React)", () => {
  it("renders a container div", () => {
    const { container } = render(<UnicornScene projectId="test-id" />);
    expect(container.firstElementChild).toBeTruthy();
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("applies custom className", () => {
    const { container } = render(
      <UnicornScene projectId="test-id" className="my-class" />
    );
    expect(container.firstElementChild).toHaveClass("my-class");
  });

  it("sets CSS custom properties for dimensions", () => {
    const { container } = render(
      <UnicornScene projectId="test-id" width={800} height={600} />
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--unicorn-width")).toBe("800px");
    expect(el.style.getPropertyValue("--unicorn-height")).toBe("600px");
  });

  it("accepts string dimensions", () => {
    const { container } = render(
      <UnicornScene projectId="test-id" width="50vw" height="100vh" />
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--unicorn-width")).toBe("50vw");
    expect(el.style.getPropertyValue("--unicorn-height")).toBe("100vh");
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

  it("shows placeholder image when loading", () => {
    render(
      <UnicornScene
        projectId="test-id"
        placeholder="/loading.png"
        showPlaceholderWhileLoading={true}
      />
    );
    const img = screen.getByAltText("Scene");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/loading.png");
  });

  it("shows placeholder className div when provided", () => {
    const { container } = render(
      <UnicornScene
        projectId="test-id"
        placeholderClassName="skeleton"
        showPlaceholderWhileLoading={true}
      />
    );
    const placeholder = container.querySelector(".skeleton");
    expect(placeholder).toBeInTheDocument();
  });

  it("shows custom React node as placeholder", () => {
    render(
      <UnicornScene
        projectId="test-id"
        placeholder={<span data-testid="custom">Loading...</span>}
        showPlaceholderWhileLoading={true}
      />
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  it("does not show error display when placeholder is present on error", () => {
    mockUseUnicornScene.mockReturnValue({
      error: new Error("Scene failed"),
    });

    render(
      <UnicornScene
        projectId="test-id"
        placeholder="/error.png"
        showPlaceholderOnError={true}
      />
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
      />
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
      })
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
      })
    );
  });
});
