const core = require('@actions/core');
const { normalizeLabelColor } = require('../src/main');
const { actionYml } = require('./action-metadata');

describe("Test normalizeLabelColor", () => {
  beforeEach(() => {
    jest.spyOn(core, 'warning').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Read from action.yml rather than hardcoded: a default that stopped being a usable color
  // would otherwise leave every default run with a GitHub-assigned one and no warning.
  it("normalizes the action.yml default to a bare hex code", () => {
    expect(normalizeLabelColor(actionYml.inputs['label-color'].default))
      .toMatch(/^[0-9a-fA-F]{6}$/);
    expect(core.warning).not.toHaveBeenCalled();
  });

  it("strips a leading '#'", () => {
    expect(normalizeLabelColor("#CB2431")).toBe("CB2431");
    expect(core.warning).not.toHaveBeenCalled();
  });

  it("passes through a bare hex code", () => {
    expect(normalizeLabelColor("CB2431")).toBe("CB2431");
  });

  it("preserves lowercase, which the API accepts", () => {
    expect(normalizeLabelColor("cb2431")).toBe("cb2431");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeLabelColor("  #CB2431  ")).toBe("CB2431");
  });

  // getInput returns '' only when a workflow sets the input empty explicitly; an unset input
  // gets the action.yml default. Empty means "let GitHub assign a color", not a mistake.
  it("returns empty without warning for an empty input", () => {
    expect(normalizeLabelColor("")).toBe("");
    expect(core.warning).not.toHaveBeenCalled();
  });

  // Values chosen not to appear in the warning's own example text, and matched with the
  // quotes around them, so the assertion cannot pass on the static part of the message.
  it.each([
    ["12345", "five digits"],
    ["1234567", "seven digits"],
    ["F00", "three-digit shorthand, which the API rejects"],
    ["GGGGGG", "non-hex characters"],
    ["red", "a color name"],
  ])("warns and drops '%s' (%s)", (input) => {
    expect(normalizeLabelColor(input)).toBe("");
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining(`"${input}"`));
  });
});
