import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { execute } from '../../src/commands/init.js';
import { GITHUB_WORKFLOW_CONTENT } from '../../src/workflows/mddd-preview.yml.js';

// ---------------------------------------------------------------------------
// System Prompt — read from disk same as init.js
// ---------------------------------------------------------------------------
const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(currentFile, '..', '..', '..');
const systemPromptContent = readFileSync(path.join(rootDir, 'system_prompt.md'), 'utf-8');
const specTemplatePath = path.join(rootDir, '.agents', 'templates', 'spec-template.md');
const cliSkillsSourceDir = path.join(rootDir, '.agents', 'skills');

// ---------------------------------------------------------------------------
// Mock InitService
// ---------------------------------------------------------------------------
function createMockInitService() {
  const calls = { createSystemPrompt: [], createSkills: [], createGitHubWorkflow: [], createSpecTemplate: [] };

  const service = {
    createSystemPrompt: mock.fn(async (content) => {
      calls.createSystemPrompt.push(content);
    }),
    createSkills: mock.fn(async (sourceDir, logger) => {
      calls.createSkills.push({ sourceDir, logger });
      logger('✅ Skill successfully encapsulated: .agents/skills/md-new');
    }),
    createGitHubWorkflow: mock.fn(async (workflowYaml, logger) => {
      calls.createGitHubWorkflow.push({ workflowYaml, logger });
      logger('✅ GitHub workflow created: .github/workflows/mddd-preview.yml');
      return '.github/workflows/mddd-preview.yml';
    }),
    createSpecTemplate: mock.fn(async (sourceTemplatePath, logger) => {
      calls.createSpecTemplate.push({ sourceTemplatePath, logger });
      logger('✅ Spec template copied: .agents/templates/spec-template.md');
    }),
  };

  return { service, calls };
}

// ---------------------------------------------------------------------------
// Tests — Decision Matrix coverage
// - Step 0a: Read system_prompt.md from disk
// - Step 0b: Import workflow YAML
// - Step 1: createSystemPrompt writes system_prompt.md
// - Step 2: createSkills receives source dir path + logger
// - Step 3: createGitHubWorkflow writes .github/workflows/mddd-preview.yml
// - Step 4: createSpecTemplate copies spec-template.md
// - Step 5: console.log success report
// ---------------------------------------------------------------------------
describe('execute() — md init command (v1.6.0)', () => {
  it('Step 0a: system_prompt.md is readable and contains MDDD protocol', () => {
    assert.ok(systemPromptContent.length > 0);
    assert.ok(systemPromptContent.includes('Mermaid Diagram Driven Development'));
    assert.ok(systemPromptContent.includes('UNIVERSAL RULE'));
  });

  it('Step 0b: GITHUB_WORKFLOW_CONTENT is a non-empty string containing YAML keywords', () => {
    assert.equal(typeof GITHUB_WORKFLOW_CONTENT, 'string');
    assert.ok(GITHUB_WORKFLOW_CONTENT.length > 0);
    assert.ok(GITHUB_WORKFLOW_CONTENT.includes('name:'));
    assert.ok(GITHUB_WORKFLOW_CONTENT.includes('build-comment'));
    assert.ok(GITHUB_WORKFLOW_CONTENT.includes('actions/checkout@v4'));
  });

  it('Step 1: calls initService.createSystemPrompt with system_prompt.md content', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createSystemPrompt.length, 1);
    assert.equal(
      calls.createSystemPrompt[0],
      systemPromptContent,
      'Should pass system_prompt.md content to createSystemPrompt',
    );
  });

  it('Step 2: calls initService.createSkills with resolved source dir path and a logger', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createSkills.length, 1);
    assert.equal(
      calls.createSkills[0].sourceDir,
      cliSkillsSourceDir,
      'Should pass the resolved .agents/skills path to createSkills',
    );
    assert.equal(typeof calls.createSkills[0].logger, 'function');
  });

  it('Step 2: logger is invoked during createSkills', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    const loggedMessages = [];
    calls.createSkills[0].logger = (msg) => loggedMessages.push(msg);

    calls.createSkills[0].logger('✅ Skill successfully encapsulated: .agents/skills/md-new');

    assert.equal(loggedMessages.length, 1);
    assert.ok(loggedMessages[0].includes('Skill successfully encapsulated'));
  });

  it('Step 3: calls initService.createGitHubWorkflow with GITHUB_WORKFLOW_CONTENT and a logger', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createGitHubWorkflow.length, 1);
    assert.equal(
      calls.createGitHubWorkflow[0].workflowYaml,
      GITHUB_WORKFLOW_CONTENT,
      'Should pass GITHUB_WORKFLOW_CONTENT to createGitHubWorkflow',
    );
    assert.equal(typeof calls.createGitHubWorkflow[0].logger, 'function');
  });

  it('Step 3: logger is invoked during createGitHubWorkflow', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    const loggedMessages = [];
    calls.createGitHubWorkflow[0].logger = (msg) => loggedMessages.push(msg);

    calls.createGitHubWorkflow[0].logger('✅ GitHub workflow created: .github/workflows/mddd-preview.yml');

    assert.equal(loggedMessages.length, 1);
    assert.ok(loggedMessages[0].includes('mddd-preview.yml'));
  });

  it('Step 4: calls initService.createSpecTemplate with the correct source path and a logger', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createSpecTemplate.length, 1);
    assert.equal(
      calls.createSpecTemplate[0].sourceTemplatePath,
      specTemplatePath,
      'Should pass the resolved spec-template.md path to createSpecTemplate',
    );
    assert.equal(typeof calls.createSpecTemplate[0].logger, 'function');
  });

  it('Step 4: logger is invoked during createSpecTemplate', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    const loggedMessages = [];
    calls.createSpecTemplate[0].logger = (msg) => loggedMessages.push(msg);

    calls.createSpecTemplate[0].logger('✅ Spec template copied: .agents/templates/spec-template.md');

    assert.equal(loggedMessages.length, 1);
    assert.ok(loggedMessages[0].includes('spec-template.md'));
  });

  it('Steps 1-5: all four InitService methods are called', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createSystemPrompt.length, 1);
    assert.equal(calls.createSkills.length, 1);
    assert.equal(calls.createGitHubWorkflow.length, 1);
    assert.equal(calls.createSpecTemplate.length, 1);
  });

  it('Step 5: prints green success messages to stdout', async () => {
    const { service } = createMockInitService();
    const logs = [];

    const originalLog = console.log;
    console.log = (msg) => logs.push(msg);

    try {
      await execute(service);
    } finally {
      console.log = originalLog;
    }

    // console.log calls: 1 (skill logger) + 1 (workflow logger) + 1 (spec template logger) + 2 (success report)
    assert.equal(logs.length, 5);
    assert.ok(logs[3].includes('generated successfully'));
    assert.ok(logs[4].includes('Run the "md init" command'));
  });
});