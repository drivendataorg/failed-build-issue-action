import { describe, expect, it, vi } from 'vitest';
import * as core from '@actions/core';
import { normalizeLabelDescription } from '../src/main.js';
import { actionYml } from './action-metadata.js';

vi.mock('@actions/core', async (importOriginal) => ({
  ...(await importOriginal()),
  warning: vi.fn(),
}));

describe("Test normalizeLabelDescription", () => {
  // Read from action.yml rather than hardcoded: a default that grew past the limit would
  // otherwise leave every created label with no description and only a warning to show it.
  it("passes the action.yml default through unchanged", () => {
    const defaultDescription = actionYml.inputs['label-description'].default;
    expect(normalizeLabelDescription(defaultDescription)).toBe(defaultDescription);
    expect(core.warning).not.toHaveBeenCalled();
  });

  it("passes through a description at the limit", () => {
    const description = "a".repeat(100);
    expect(normalizeLabelDescription(description)).toBe(description);
    expect(core.warning).not.toHaveBeenCalled();
  });

  it("warns and drops a description one character over the limit", () => {
    expect(normalizeLabelDescription("a".repeat(101))).toBe("");
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining("101 characters"));
  });

  it("returns empty without warning for an empty input", () => {
    expect(normalizeLabelDescription("")).toBe("");
    expect(core.warning).not.toHaveBeenCalled();
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeLabelDescription("  Build failed in CI  ")).toBe("Build failed in CI");
  });
});
