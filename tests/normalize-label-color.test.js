const core = require('@actions/core');
const { normalizeLabelColor } = require('../src/main');

describe("Test normalizeLabelColor", () => {
  beforeEach(() => {
    jest.spyOn(core, 'warning').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // The action.yml default is '#CB2431', so this is the path every default run takes.
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

  // getInput returns '' for an input the workflow left unset, which means
  // "let GitHub assign a color" rather than a mistake worth warning about.
  it("returns empty without warning for an unset input", () => {
    expect(normalizeLabelColor("")).toBe("");
    expect(core.warning).not.toHaveBeenCalled();
  });

  it.each([
    ["CB243", "five digits"],
    ["CB24311", "seven digits"],
    ["CB2", "three-digit shorthand, which the API rejects"],
    ["GGGGGG", "non-hex characters"],
    ["red", "a color name"],
  ])("warns and drops '%s' (%s)", (input) => {
    expect(normalizeLabelColor(input)).toBe("");
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining(input));
  });
});
