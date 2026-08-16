import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  UNICORN_STUDIO_VERSION,
  UNICORN_STUDIO_CDN_URL,
  DEFAULT_VALUES,
  VALID_FPS,
} from "../shared/constants";
import { BUNDLED_UNICORN_SDK } from "../shared/sdk-bundle";
import { version as packageVersion } from "../../package.json";

describe("constants", () => {
  it("CDN URL includes the version", () => {
    expect(UNICORN_STUDIO_CDN_URL).toContain(UNICORN_STUDIO_VERSION);
  });

  it("package version matches UNICORN_STUDIO_VERSION", () => {
    expect(packageVersion).toBe(UNICORN_STUDIO_VERSION);
  });

  it("bundled SDK core matches UNICORN_STUDIO_VERSION", () => {
    const core = BUNDLED_UNICORN_SDK.scripts.find(
      (script) => script.id === "core",
    );
    expect(BUNDLED_UNICORN_SDK.available).toBe(true);
    expect(core?.content).toContain(`"${UNICORN_STUDIO_VERSION}"`);
  });

  it("bundled SDK scripts are byte-identical to vendor files", () => {
    const vendorDir = join(process.cwd(), "vendor", "unicornstudio");
    const sha256 = (content: string) =>
      createHash("sha256").update(content).digest("hex");

    expect(BUNDLED_UNICORN_SDK.scripts.map((script) => script.id)).toEqual([
      "core",
      "model-renderer",
      "three-bundle",
    ]);

    for (const script of BUNDLED_UNICORN_SDK.scripts) {
      const vendorContent = readFileSync(
        join(vendorDir, script.relativePath),
        "utf8",
      );
      expect(script.content.length, script.relativePath).toBe(
        vendorContent.length,
      );
      expect(sha256(script.content), script.relativePath).toBe(
        sha256(vendorContent),
      );
    }
  });

  it("CDN URL points to jsdelivr", () => {
    expect(UNICORN_STUDIO_CDN_URL).toMatch(/^https:\/\/cdn\.jsdelivr\.net\//);
  });

  it("VALID_FPS contains expected values", () => {
    expect([...VALID_FPS]).toEqual([15, 24, 30, 60, 120]);
  });

  it("DEFAULT_VALUES has expected defaults", () => {
    expect(DEFAULT_VALUES.width).toBe("100%");
    expect(DEFAULT_VALUES.height).toBe("100%");
    expect(DEFAULT_VALUES.scale).toBe(1);
    expect(DEFAULT_VALUES.dpi).toBe(1.5);
    expect(DEFAULT_VALUES.fps).toBe(60);
    expect(DEFAULT_VALUES.altText).toBe("Scene");
    expect(DEFAULT_VALUES.lazyLoad).toBe(true);
    expect(DEFAULT_VALUES.production).toBe(true);
    expect(DEFAULT_VALUES.paused).toBe(false);
  });
});
