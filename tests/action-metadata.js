import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

// Single source of truth for the action's declared metadata, parsed straight
// from action.yml so tests can assert against it instead of hand-copied values.
export const actionYml = YAML.parse(
  fs.readFileSync(path.join(import.meta.dirname, '..', 'action.yml'), 'utf8'),
);

export const declaredInputs = Object.keys(actionYml.inputs).sort();
