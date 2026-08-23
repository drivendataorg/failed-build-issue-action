const util = require('util');
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

// The API rejects a description over this length
const LABEL_DESCRIPTION_MAX_LENGTH = 100;

// Over-long values are dropped, which creates the label without a description
const normalizeLabelDescription = (input) => {
  const description = (input || "").trim();
  if (description.length <= LABEL_DESCRIPTION_MAX_LENGTH) return description;
  core.warning(
    `Ignoring 'label-description' value of ${description.length} characters, over the ` +
    `${LABEL_DESCRIPTION_MAX_LENGTH} GitHub allows. Creating the label without a description.`
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
      labelDescription: normalizeLabelDescription(core.getInput('label-description')),
      alwaysCreateNewIssue: core.getBooleanInput('always-create-new-issue'),
    })
    const htmlUrl = created.html_url
    core.info("Created url: " + htmlUrl);

    core.setOutput('issue-number', issueNumber);
    core.setOutput('html-url', htmlUrl);
  } catch (error) {
    // util.inspect is what console.error uses to format errors
    core.debug("Error:\n" + util.inspect(error, { depth: null }))
    core.setFailed(error.message);
  }
}

module.exports = { run };
// Exported for unit tests; not part of the action's interface.
module.exports.normalizeLabelColor = normalizeLabelColor;
module.exports.normalizeLabelDescription = normalizeLabelDescription;
