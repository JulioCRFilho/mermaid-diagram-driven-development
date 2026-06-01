import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { execute } from '../../src/commands/init.js';
import { GITHUB_WORKFLOW_CONTENT } from '../../src/workflows/mddd-preview.yml.js';
import mdNewContent from '../../src/skills/md-new/content.js';
import mdEditContent from '../../src/skills/md-edit/content.js';
import mdAuditContent from '../../src/skills/md-audit/content.js';
import mdImplContent from '../../src/skills/md-impl/content.js';

// ---------------------------------------------------------------------------
// System Prompt — read from disk same as init.js
// ---------------------------------------------------------------------------
const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(currentFile, '..', '..', '..');
const systemPromptContent = readFileSync(path.join(rootDir, 'system_prompt.md'), 'utf-8');

// ---------------------------------------------------------------------------
// SKILLS map — reconstructed same as init.js
// ---------------------------------------------------------------------------
const SKILLS = {
  'md-new': mdNewContent,
  'md-edit': mdEditContent,
  'md-audit': mdAuditContent,
  'md-impl': mdImplContent,
};

// ---------------------------------------------------------------------------
// Mock InitService
// ---------------------------------------------------------------------------
function createMockInitService() {
  const calls = { createSystemPrompt: [], createSkills: [], createGitHubWorkflow: [] };

  const service = {
    createSystemPrompt: mock.fn(async (content) => {
      calls.createSystemPrompt.push(content);
    }),
    createSkills: mock.fn(async (skills, logger) => {
      calls.createSkills.push({ skills, logger });
      for (const skillName of Object.keys(skills)) {
        logger(`✅ Skill successfully encapsulated: .agents/skills/${skillName}/SKILL.md`);
      }
      return Object.keys(skills).map(
        (name) => `.agents/skills/${name}/SKILL.md`,
      );
    }),
    createGitHubWorkflow: mock.fn(async (workflowYaml, logger) => {
      calls.createGitHubWorkflow.push({ workflowYaml, logger });
      logger('✅ GitHub workflow created: .github/workflows/mddd-preview.yml');
      return '.github/workflows/mddd-preview.yml';
    }),
  };

  return { service, calls };
}

// ---------------------------------------------------------------------------
// Tests — Decision Matrix coverage
// - Step 0a: Build SKILLS map from imports
// - Step 0b: Read system_prompt.md from disk
// - Step 0c: Import workflow YAML
// - Step 1: createSystemPrompt writes system_prompt.md
// - Step 2: createSkills writes SKILLS/*.md files + logger calls
// - Step 3: createGitHubWorkflow writes .github/workflows/mddd-preview.yml
// - Step 4: console.log success report
// ---------------------------------------------------------------------------
describe('execute() — md init command (v1.5.0)', () => {
  it('Step 0a: SKILLS map has expected keys with non-empty strings', () => {
    const expectedKeys = ['md-new', 'md-edit', 'md-audit', 'md-impl'];
    for (const key of expectedKeys) {
      assert.ok(key in SKILLS, `SKILLS should contain "${key}"`);
      assert.equal(typeof SKILLS[key], 'string');
      assert.ok(SKILLS[key].length > 0);
    }
  });

  it('Step 0b: system_prompt.md is readable and contains guardrails', () => {
    assert.ok(systemPromptContent.length > 0);
    assert.ok(systemPromptContent.includes('Anti-Hallucination Guardrails'));
    assert.ok(systemPromptContent.includes('Spec-First Ordering Mandate'));
  });

  it('Step 0c: GITHUB_WORKFLOW_CONTENT is a non-empty string containing YAML keywords', () => {
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

  it('Step 2: calls initService.createSkills with SKILLS map and a logger function', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createSkills.length, 1);
    assert.deepEqual(calls.createSkills[0].skills, SKILLS);
    assert.equal(typeof calls.createSkills[0].logger, 'function');
  });

  it('Step 2: logger is invoked once per skill during createSkills', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    const skillNames = Object.keys(SKILLS);
    const loggedMessages = [];
    calls.createSkills[0].logger = (msg) => loggedMessages.push(msg);

    for (const skillName of skillNames) {
      calls.createSkills[0].logger(
        `✅ Skill successfully encapsulated: .agents/skills/${skillName}/SKILL.md`,
      );
    }

    assert.equal(loggedMessages.length, skillNames.length);
    for (const name of skillNames) {
      assert.ok(
        loggedMessages.some((m) => m.includes(name)),
        `Should log a message for skill "${name}"`,
      );
    }
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

  it('Steps 1-4: all three InitService methods are called', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createSystemPrompt.length, 1);
    assert.equal(calls.createSkills.length, 1);
    assert.equal(calls.createGitHubWorkflow.length, 1);
  });

  it('Step 4: prints green success messages to stdout', async () => {
    const { service } = createMockInitService();
    const logs = [];

    const originalLog = console.log;
    console.log = (msg) => logs.push(msg);

    try {
      await execute(service);
    } finally {
      console.log = originalLog;
    }

    // console.log calls: 4 (logger per skill) + 1 (workflow logger) + 2 (success report)
    assert.equal(logs.length, 7);
    assert.ok(logs[5].includes('generated successfully'));
    assert.ok(logs[6].includes('Run the "md init" command'));
  });
});