#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pc from 'picocolors';

import mdNewContent from '../skills/md-new/content.js';
import mdEditContent from '../skills/md-edit/content.js';
import mdAuditContent from '../skills/md-audit/content.js';
import mdImplContent from '../skills/md-impl/content.js';
import { GITHUB_WORKFLOW_CONTENT } from '../workflows/mddd-preview.yml.js';

/**
 * Build the SKILLS map from co-located modules.
 * @type {Record<string, string>}
 */
const SKILLS = {
  'md-new': mdNewContent,
  'md-edit': mdEditContent,
  'md-audit': mdAuditContent,
  'md-impl': mdImplContent,
};

/**
 * Resolve and read system_prompt.md from the project root.
 * @returns {string}
 */
function readSystemPrompt() {
  const currentFile = fileURLToPath(import.meta.url);
  const rootDir = path.resolve(path.dirname(currentFile), '..', '..');
  const promptPath = path.join(rootDir, 'system_prompt.md');
  return readFileSync(promptPath, 'utf-8');
}

/**
 * Executes the `md init` command.
 * @param {import('../services/InitService.js').InitService} initService
 * @returns {Promise<void>}
 */
export async function execute(initService) {
  const systemPrompt = readSystemPrompt();

  await initService.createSystemPrompt(systemPrompt);
  await initService.createSkills(SKILLS, (msg) => console.log(msg));
  await initService.createGitHubWorkflow(GITHUB_WORKFLOW_CONTENT, (msg) => console.log(msg));

  console.log(pc.green('\n🚀 Universal [system_prompt.md] and SKILLS generated successfully in the project root!'));
  console.log(pc.green('Run the "md init" command whenever you update the MDDD-CLI NPM package.'));
}