#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pc from 'picocolors';

import { GITHUB_WORKFLOW_CONTENT } from '../workflows/mddd-preview.yml.js';

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

  // 1. Descobre o caminho absoluto real da pasta oculta interna do pacote da CLI
  // Subindo de: src/commands/ -> src/ -> raiz do pacote CLI -> .agents/skills
  const currentFile = fileURLToPath(import.meta.url);
  const cliSkillsSourceDir = path.resolve(path.dirname(currentFile), '..', '..', '.agents', 'skills');

  await initService.createSystemPrompt(systemPrompt);
  
  // 2. Passa o caminho da pasta oculta de origem para o serviço clonar recursivamente
  await initService.createSkills(cliSkillsSourceDir, (msg) => console.log(msg));
  
  await initService.createGitHubWorkflow(GITHUB_WORKFLOW_CONTENT, (msg) => console.log(msg));

  console.log(pc.green('\n🚀 Universal [system_prompt.md] and SKILLS generated successfully in the project root!'));
  console.log(pc.green('Run the "md init" command whenever you update the MDDD-CLI NPM package.'));
}