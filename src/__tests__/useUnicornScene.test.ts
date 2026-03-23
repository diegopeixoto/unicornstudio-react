import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUnicornScene } from "../shared/hooks";
import type { UnicornStudioScene } from "../shared/types";
import { MockResizeObserver } from "./setup";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockScene(
  overrides: Partial<UnicornStudioScene> = {},
): UnicornStudioScene {
  return {
    element: document.createElement("div"),
    destroy: vi.fn(),
    paused: false,
    ...overrides,
  };
}

/** Minimal valid props – every test spreads overrides on top of this. */
function defaultProps(
  elementRef: React.RefObject<HTMLDivElement | null>,
): Parameters<typeof useUnicornScene>[0] {
  return {
    elementRef,
    projectId: "test-project",
    scale: 1,
    dpi: 1.5,
    fps: 60,
    lazyLoad: false,
    altText: "Test",
    ariaLabel: "Test scene",
    isScriptLoaded: true,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("useUnicornScene", () => {
  let addSceneMock: ReturnType<typeof vi.fn>;
  let containerEl: HTMLDivElement;
  let elementRef: { current: HTMLDivElement | null };

  beforeEach(() => {
    addSceneMock = vi.fn();
    (window as Record<string, unknown>).UnicornStudio = {
      addScene: addSceneMock,
      init: vi.fn(),
      destroy: vi.fn(),
    };

    containerEl = document.createElement("div");
    containerEl.id = "test-container";
    document.body.appendChild(containerEl);
    elementRef = { current: containerEl };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as Record<string, unknown>).UnicornStudio;
    containerEl.remove();
    MockResizeObserver.instances.length = 0;
  });

  // -----------------------------------------------------------------------
  // Basic initialization
  // -----------------------------------------------------------------------

  it("initializes a scene when script is loaded", async () => {
    const scene = createMockScene();
    addSceneMock.mockResolvedValueOnce(scene);

    const { result } = renderHook(() =>
      useUnicornScene(defaultProps(elementRef)),
    );

    // Let the async initializeScene resolve
    await act(async () => {});

    expect(addSceneMock).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it("does not initialize when isScriptLoaded is false", async () => {
    const { result } = renderHook(() =>
      useUnicornScene({ ...defaultProps(elementRef), isScriptLoaded: false }),
    );

    await act(async () => {});

    expect(addSceneMock).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  // -----------------------------------------------------------------------
  // Callbacks: onLoad / onError
  // -----------------------------------------------------------------------

  it("fires onLoad after successful initialization", async () => {
    const scene = createMockScene();
    addSceneMock.mockResolvedValueOnce(scene);
    const onLoad = vi.fn();

    renderHook(() => useUnicornScene({ ...defaultProps(elementRef), onLoad }));

    await act(async () => {});

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it("fires onError on initialization failure", async () => {
    addSceneMock.mockRejectedValueOnce(new Error("boom"));
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useUnicornScene({ ...defaultProps(elementRef), onError }),
    );

    await act(async () => {});

    expect(onError).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  // -----------------------------------------------------------------------
  // Callback identity stability – changing onLoad/onError should NOT
  // re-trigger addScene because the hook stores them in stable refs.
  // -----------------------------------------------------------------------

  it("does not re-initialize when only onLoad/onError identities change", async () => {
    const scene = createMockScene();
    addSceneMock.mockResolvedValue(scene);

    const { rerender } = renderHook((props) => useUnicornScene(props), {
      initialProps: { ...defaultProps(elementRef), onLoad: () => {} },
    });

    await act(async () => {});
    expect(addSceneMock).toHaveBeenCalledTimes(1);

    // Rerender with a brand-new onLoad function reference
    rerender({ ...defaultProps(elementRef), onLoad: () => {} });
    await act(async () => {});

    // addScene should still have been called only once
    expect(addSceneMock).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------------
  // Re-initialization on config changes
  // -----------------------------------------------------------------------

  it("re-initializes when projectId changes", async () => {
    const scene1 = createMockScene();
    const scene2 = createMockScene();
    addSceneMock.mockResolvedValueOnce(scene1).mockResolvedValueOnce(scene2);

    const { rerender } = renderHook((props) => useUnicornScene(props), {
      initialProps: defaultProps(elementRef),
    });

    await act(async () => {});
    expect(addSceneMock).toHaveBeenCalledTimes(1);

    rerender({ ...defaultProps(elementRef), projectId: "different-project" });
    await act(async () => {});

    expect(addSceneMock).toHaveBeenCalledTimes(2);
    // The first scene should have been destroyed during re-init
    expect(scene1.destroy).toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Cleanup on unmount
  // -----------------------------------------------------------------------

  it("destroys the scene on unmount", async () => {
    const scene = createMockScene();
    addSceneMock.mockResolvedValueOnce(scene);

    const { unmount } = renderHook(() =>
      useUnicornScene(defaultProps(elementRef)),
    );

    await act(async () => {});
    expect(scene.destroy).not.toHaveBeenCalled();

    unmount();
    expect(scene.destroy).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------------
  // Concurrent initialization guard
  // -----------------------------------------------------------------------

  it("re-initializes when config deps change while init is in-flight", async () => {
    // When effect deps change, React cleans up the old effect (resetting the
    // guard via destroyScene) and runs a new one — so a second addScene is
    // expected and correct.
    let resolveFirst!: (s: UnicornStudioScene) => void;
    addSceneMock
      .mockImplementationOnce(
        () =>
          new Promise<UnicornStudioScene>((r) => {
            resolveFirst = r;
          }),
      )
      .mockResolvedValueOnce(createMockScene());

    const { rerender } = renderHook((props) => useUnicornScene(props), {
      initialProps: defaultProps(elementRef),
    });

    await act(async () => {});
    expect(addSceneMock).toHaveBeenCalledTimes(1);

    // Change config → effect cleanup + new effect
    rerender({ ...defaultProps(elementRef), fps: 30 as const });
    await act(async () => {});

    expect(addSceneMock).toHaveBeenCalledTimes(2);

    // Resolve the first (its ignore flag is set, so the scene gets destroyed)
    const lateScene = createMockScene();
    await act(async () => {
      resolveFirst(lateScene);
    });
    expect(lateScene.destroy).toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // sceneRef forwarding
  // -----------------------------------------------------------------------

  it("assigns scene to a callback sceneRef", async () => {
    const scene = createMockScene();
    addSceneMock.mockResolvedValueOnce(scene);

    const sceneRefCallback = vi.fn();

    renderHook(() =>
      useUnicornScene({
        ...defaultProps(elementRef),
        sceneRef: sceneRefCallback,
      }),
    );

    await act(async () => {});

    expect(sceneRefCallback).toHaveBeenCalledWith(scene);
  });

  it("assigns scene to an object sceneRef", async () => {
    const scene = createMockScene();
    addSceneMock.mockResolvedValueOnce(scene);

    const sceneObjRef: { current: UnicornStudioScene | null } = {
      current: null,
    };

    renderHook(() =>
      useUnicornScene({
        ...defaultProps(elementRef),
        sceneRef: sceneObjRef,
      }),
    );

    await act(async () => {});

    expect(sceneObjRef.current).toBe(scene);
  });

  it("rerender-with-new-ref: nulls old ref and assigns scene to new ref", async () => {
    const scene = createMockScene();
    addSceneMock.mockResolvedValue(scene);

    const oldRef: { current: UnicornStudioScene | null } = { current: null };
    const newRef: { current: UnicornStudioScene | null } = { current: null };

    const { rerender } = renderHook((props) => useUnicornScene(props), {
      initialProps: {
        ...defaultProps(elementRef),
        sceneRef: oldRef,
      },
    });

    await act(async () => {});
    expect(oldRef.current).toBe(scene);

    // Replace sceneRef prop with a new ref
    rerender({ ...defaultProps(elementRef), sceneRef: newRef });

    // Old ref should be nulled, new ref should receive the scene
    expect(oldRef.current).toBeNull();
    expect(newRef.current).toBe(scene);
  });

  it("rerender-with-new-callback-ref: nulls old and assigns to new", async () => {
    const scene = createMockScene();
    addSceneMock.mockResolvedValue(scene);

    const oldRefFn = vi.fn();
    const newRefFn = vi.fn();

    const { rerender } = renderHook((props) => useUnicornScene(props), {
      initialProps: {
        ...defaultProps(elementRef),
        sceneRef: oldRefFn,
      },
    });

    await act(async () => {});
    expect(oldRefFn).toHaveBeenCalledWith(scene);

    // Replace with new callback ref
    rerender({ ...defaultProps(elementRef), sceneRef: newRefFn });

    // Old callback should have been called with null
    expect(oldRefFn).toHaveBeenCalledWith(null);
    // New callback should receive the current scene
    expect(newRefFn).toHaveBeenCalledWith(scene);
  });

  // -----------------------------------------------------------------------
  // Paused state synchronization
  // -----------------------------------------------------------------------

  it("syncs paused state with the scene", async () => {
    const scene = createMockScene({ paused: false });
    addSceneMock.mockResolvedValueOnce(scene);

    const { rerender } = renderHook((props) => useUnicornScene(props), {
      initialProps: { ...defaultProps(elementRef), paused: false },
    });

    await act(async () => {});

    rerender({ ...defaultProps(elementRef), paused: true });
    expect(scene.paused).toBe(true);

    rerender({ ...defaultProps(elementRef), paused: false });
    expect(scene.paused).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Validation errors
  // -----------------------------------------------------------------------

  it("returns an error for invalid scale", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useUnicornScene({
        ...defaultProps(elementRef),
        scale: 5 as unknown as number,
        onError,
      }),
    );

    await act(async () => {});

    expect(result.current.error).toBeInstanceOf(Error);
    expect(addSceneMock).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Error sanitization
  // -----------------------------------------------------------------------

  it("sanitizes 404 errors", async () => {
    addSceneMock.mockRejectedValueOnce(new Error("404 not found"));

    const { result } = renderHook(() =>
      useUnicornScene(defaultProps(elementRef)),
    );

    await act(async () => {});

    expect(result.current.error?.message).toBe("Resource not found");
  });

  it("sanitizes network errors", async () => {
    addSceneMock.mockRejectedValueOnce(new Error("Network failure"));

    const { result } = renderHook(() =>
      useUnicornScene(defaultProps(elementRef)),
    );

    await act(async () => {});

    expect(result.current.error?.message).toBe("Network error occurred");
  });

  // -----------------------------------------------------------------------
  // Cleanup when addScene resolves after unmount (ignore flag)
  // -----------------------------------------------------------------------

  it("destroys the scene if it resolves after unmount", async () => {
    const scene = createMockScene();
    let resolveAddScene!: (s: UnicornStudioScene) => void;
    addSceneMock.mockImplementationOnce(
      () =>
        new Promise<UnicornStudioScene>((r) => {
          resolveAddScene = r;
        }),
    );

    const { unmount } = renderHook(() =>
      useUnicornScene(defaultProps(elementRef)),
    );

    // Start init, then unmount before it resolves
    await act(async () => {});
    unmount();

    // Now let addScene resolve – the ignore flag should destroy the scene
    await act(async () => {
      resolveAddScene(scene);
    });

    expect(scene.destroy).toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Same-config skip (deduplication guard)
  // -----------------------------------------------------------------------

  it("skips re-initialization when config has not changed", async () => {
    const scene = createMockScene();
    addSceneMock.mockResolvedValue(scene);

    const props = defaultProps(elementRef);
    const { rerender } = renderHook((p) => useUnicornScene(p), {
      initialProps: props,
    });

    await act(async () => {});
    expect(addSceneMock).toHaveBeenCalledTimes(1);

    // Rerender with identical config — React won't re-run the effect
    // since deps are the same, so addScene stays at 1 call
    rerender(props);
    await act(async () => {});

    expect(addSceneMock).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------------
  // UnicornStudio.addScene not available
  // -----------------------------------------------------------------------

  it("errors when UnicornStudio.addScene is not available", async () => {
    (window as Record<string, unknown>).UnicornStudio = {};
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useUnicornScene({ ...defaultProps(elementRef), onError }),
    );

    await act(async () => {});

    expect(result.current.error?.message).toBeTruthy();
    expect(onError).toHaveBeenCalled();
    expect(addSceneMock).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // jsonFilePath path
  // -----------------------------------------------------------------------

  it("initializes with jsonFilePath instead of projectId", async () => {
    const scene = createMockScene();
    addSceneMock.mockResolvedValueOnce(scene);

    renderHook(() =>
      useUnicornScene({
        ...defaultProps(elementRef),
        projectId: undefined,
        jsonFilePath: "/scenes/test.json",
      }),
    );

    await act(async () => {});

    expect(addSceneMock).toHaveBeenCalledTimes(1);
    const config = addSceneMock.mock.calls[0][0];
    expect(config.filePath).toBe("/scenes/test.json");
    expect(config.projectId).toBeUndefined();
  });

  // -----------------------------------------------------------------------
  // Neither projectId nor jsonFilePath
  // -----------------------------------------------------------------------

  it("errors when neither projectId nor jsonFilePath is provided", async () => {
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useUnicornScene({
        ...defaultProps(elementRef),
        projectId: undefined,
        jsonFilePath: undefined,
        onError,
      }),
    );

    await act(async () => {});

    expect(onError).toHaveBeenCalled();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  // -----------------------------------------------------------------------
  // No element ref
  // -----------------------------------------------------------------------

  it("does not initialize when elementRef is null", async () => {
    const nullRef = { current: null };

    renderHook(() =>
      useUnicornScene({ ...defaultProps(nullRef), isScriptLoaded: true }),
    );

    await act(async () => {});

    expect(addSceneMock).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Timeout sanitization
  // -----------------------------------------------------------------------

  it("sanitizes timeout errors", async () => {
    addSceneMock.mockRejectedValueOnce(new Error("timeout exceeded"));

    const { result } = renderHook(() =>
      useUnicornScene(defaultProps(elementRef)),
    );

    await act(async () => {});

    expect(result.current.error?.message).toBe("Loading timeout");
  });

  // -----------------------------------------------------------------------
  // Non-Error thrown
  // -----------------------------------------------------------------------

  it("handles non-Error thrown values", async () => {
    addSceneMock.mockRejectedValueOnce("string error");

    const { result } = renderHook(() =>
      useUnicornScene(defaultProps(elementRef)),
    );

    await act(async () => {});

    expect(result.current.error?.message).toBe("Unknown error");
  });

  // -----------------------------------------------------------------------
  // addScene returns null/undefined
  // -----------------------------------------------------------------------

  it("errors when addScene resolves with null", async () => {
    addSceneMock.mockResolvedValueOnce(null);
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useUnicornScene({ ...defaultProps(elementRef), onError }),
    );

    await act(async () => {});

    expect(onError).toHaveBeenCalled();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  // -----------------------------------------------------------------------
  // ResizeObserver – container resize triggers scene.resize()
  // -----------------------------------------------------------------------

  it("calls scene.resize() when the container is resized", async () => {
    const resizeFn = vi.fn();
    const scene = createMockScene({ resize: resizeFn });
    addSceneMock.mockResolvedValueOnce(scene);

    renderHook(() => useUnicornScene(defaultProps(elementRef)));

    await act(async () => {});

    // Find the observer watching our container
    const observer = MockResizeObserver.instances.find((o) =>
      o.elements.has(containerEl),
    );
    expect(observer).toBeDefined();

    // Simulate a container resize
    act(() => {
      observer!.simulateResize(containerEl);
    });

    expect(resizeFn).toHaveBeenCalledTimes(1);
  });

  it("handles scene.resize being undefined gracefully", async () => {
    const scene = createMockScene({ resize: undefined });
    addSceneMock.mockResolvedValueOnce(scene);

    renderHook(() => useUnicornScene(defaultProps(elementRef)));

    await act(async () => {});

    const observer = MockResizeObserver.instances.find((o) =>
      o.elements.has(containerEl),
    );

    // Should not throw when resize is undefined
    expect(() => {
      act(() => {
        observer!.simulateResize(containerEl);
      });
    }).not.toThrow();
  });

  it("disconnects the ResizeObserver on unmount", async () => {
    const scene = createMockScene({ resize: vi.fn() });
    addSceneMock.mockResolvedValueOnce(scene);

    const { unmount } = renderHook(() =>
      useUnicornScene(defaultProps(elementRef)),
    );

    await act(async () => {});

    const observer = MockResizeObserver.instances.find((o) =>
      o.elements.has(containerEl),
    );
    expect(observer).toBeDefined();

    unmount();

    expect(observer!.disconnect).toHaveBeenCalled();
  });

  it("does not create a ResizeObserver when elementRef is null", async () => {
    const instancesBefore = MockResizeObserver.instances.length;

    renderHook(() =>
      useUnicornScene({
        ...defaultProps({ current: null }),
        isScriptLoaded: true,
      }),
    );

    await act(async () => {});

    // No new observer should have been created for a null element
    const newObservers = MockResizeObserver.instances.slice(instancesBefore);
    const observersWithElements = newObservers.filter(
      (o) => o.elements.size > 0,
    );
    expect(observersWithElements).toHaveLength(0);
  });
});
