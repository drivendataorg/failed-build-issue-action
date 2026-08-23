const core = require('@actions/core');
const { normalizeLabelDescription } = require('../src/main');
const { actionYml } = require('./action-metadata');

describe("Test normalizeLabelDescription", () => {
  beforeEach(() => {
    jest.spyOn(core, 'warning').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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
