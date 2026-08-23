const core = require('@actions/core');
const newIssueOrCommentForLabel = require('./new-issue-or-comment-for-label');

// Normalizes to a bare 6-digit hex code
// Invalid values are dropped, which falls back to GitHub's random color assignment
const normalizeLabelColor = (input) => {
  const color = (input || "").trim().replace(/^#/, "");
  if (!color) return "";
  if (/^[0-9a-fA-F]{6}$/.test(color)) return color;
  core.warning(
    `Ignoring invalid 'label-color' value "${input}". Expected a 6-digit hex code, ` +
    `e.g. "CB2431". Letting GitHub assign the label color.`
  );
  return "";
};

// most @actions toolkit packages have async methods
async function run() {
  try {
    // Keyed, and in the order action.yml declares them
    const { issueNumber, created } = await newIssueOrCommentForLabel({
      githubToken: core.getInput('github-token'),
      labelName: core.getInput('label-name'),
      titleTemplate: core.getInput('title-template'),
      bodyTemplate: core.getInput('body-template'),
      createLabel: core.getBooleanInput('create-label'),
      labelColor: normalizeLabelColor(core.getInput('label-color')),
      labelDescription: core.getInput('label-description'),
      alwaysCreateNewIssue: core.getBooleanInput('always-create-new-issue'),
    })
    const htmlUrl = created.html_url
    core.info("Created url: " + htmlUrl);

    core.setOutput('issue-number', issueNumber);
    core.setOutput('html-url', htmlUrl);
  } catch (error) {
    core.debug("Error:\n" + JSON.stringify(error))
    core.setFailed(error.message);
  }
}

module.exports = { run };
// Exported for unit tests; not part of the action's interface.
module.exports.normalizeLabelColor = normalizeLabelColor;
