import { inspect } from 'node:util';
import * as core from '@actions/core';
import { newIssueOrCommentForLabel } from './new-issue-or-comment-for-label.js';

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
export async function run() {
  // GITHUB_ACTION_REF is the ref as written in the workflow's `uses:`, e.g. "v1" or a commit SHA
  if (process.env.GITHUB_ACTION_REF === 'v1') {
    core.notice(
      "The @v1 tag will no longer receive updates. " +
      "Pin to a commit SHA or exact version. " +
      "See https://github.com/drivendataorg/failed-build-issue-action#basic-usage"
    );
  }

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
    // inspect is what console.error uses to format errors
    core.debug("Error:\n" + inspect(error, { depth: null }))
    core.setFailed(error.message);
  }
}

// Exported for unit tests; not part of the action's interface.
export { normalizeLabelColor, normalizeLabelDescription };
