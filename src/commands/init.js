#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pc from 'picocolors';

import { GITHUB_WORKFLOW_CONTENT } from '../workflows/mddd-preview.yml.js';

/**
 * Resolve and read AGENTS.md from the project root.
 * @returns {string}
 */
function readSystemPrompt() {
  const currentFile = fileURLToPath(import.meta.url);
  const rootDir = path.resolve(path.dirname(currentFile), '..', '..');
  const promptPath = path.join(rootDir, 'AGENTS.md');
  return readFileSync(promptPath, 'utf-8');
}

/**
 * Executes the `md init` command.
 * @param {import('../services/InitService.js').InitService} initService
 * @returns {Promise<void>}
 */
export async function execute(initService) {
  const systemPrompt = readSystemPrompt();

  // 1. Resolve o caminho absoluto da raiz do pacote CLI
  const currentFile = fileURLToPath(import.meta.url);
  const cliRootDir = path.resolve(path.dirname(currentFile), '..', '..');

  // 2. Caminhos de origem dentro do pacote da CLI
  const cliSkillsSourceDir = path.join(cliRootDir, '.agents', 'skills');
  const cliSpecTemplatePath = path.join(cliRootDir, '.agents', 'templates', 'spec-template.md');
  const cliArchitectureTemplatePath = path.join(cliRootDir, '.agents', 'templates', 'ARCHITECTURE.template.md');

  await initService.createSystemPrompt(systemPrompt);

  // 3. Passa o caminho da pasta oculta de origem para o serviço clonar recursivamente
  await initService.createSkills(cliSkillsSourceDir, (msg) => console.log(msg));

  // 4. Cria o workflow do GitHub
  await initService.createGitHubWorkflow(GITHUB_WORKFLOW_CONTENT, (msg) => console.log(msg));

  // 5. Copia o spec template para o projeto
  await initService.createSpecTemplate(cliSpecTemplatePath, (msg) => console.log(msg));

  // 6. Copia o ARCHITECTURE template (usado pela skill mddd-context-map)
  await initService.createArchitectureTemplate(cliArchitectureTemplatePath, (msg) => console.log(msg));

  console.log(pc.green('\n🚀 Universal [AGENTS.md], SKILLS, spec template, and architecture template generated successfully in the project root!'));
  console.log(pc.green('Run the "md init" command whenever you update the MDDD-CLI NPM package.'));
}
