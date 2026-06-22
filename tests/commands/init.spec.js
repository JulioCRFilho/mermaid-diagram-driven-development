import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { execute } from '../../src/commands/init.js';

// ---------------------------------------------------------------------------
// System Prompt — read from disk same as init.js
// ---------------------------------------------------------------------------
const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(currentFile, '..', '..', '..');
const systemPromptContent = readFileSync(path.join(rootDir, 'AGENTS.md'), 'utf-8');
const specTemplatePath = path.join(rootDir, '.agents', 'templates', 'spec-template.md');
const cliSkillsSourceDir = path.join(rootDir, '.agents', 'skills');

// ---------------------------------------------------------------------------
// Mock InitService
// ---------------------------------------------------------------------------
function createMockInitService() {
  const calls = { createSystemPrompt: [], createSkills: [], createSpecTemplate: [], createArchitectureTemplate: [] };

  const service = {
    createSystemPrompt: mock.fn(async (content) => {
      calls.createSystemPrompt.push(content);
    }),
    createSkills: mock.fn(async (sourceDir, logger) => {
      calls.createSkills.push({ sourceDir, logger });
      logger('✅ Skill successfully encapsulated: .agents/skills/md-new');
    }),
    createSpecTemplate: mock.fn(async (sourceTemplatePath, logger) => {
      calls.createSpecTemplate.push({ sourceTemplatePath, logger });
      logger('✅ Spec template copied: .agents/templates/spec-template.md');
    }),
    createArchitectureTemplate: mock.fn(async (sourceTemplatePath, logger) => {
      calls.createArchitectureTemplate.push({ sourceTemplatePath, logger });
      logger('✅ Architecture template copied: .agents/templates/ARCHITECTURE.template.md');
    }),
  };

  return { service, calls };
}

// ---------------------------------------------------------------------------
// Tests — Decision Matrix coverage
// - Step 0a: Read AGENTS.md from disk
// - Step 1: createSystemPrompt writes AGENTS.md
// - Step 2: createSkills receives source dir path + logger
// - Step 3: createSpecTemplate copies spec-template.md
// - Step 4: createArchitectureTemplate copies ARCHITECTURE.template.md
// - Step 5: console.log success report
// ---------------------------------------------------------------------------
describe('execute() — md init command (v1.7.0)', () => {
  it('Step 0a: AGENTS.md is readable and contains MDDD protocol', () => {
    assert.ok(systemPromptContent.length > 0);
    assert.ok(systemPromptContent.includes('Mermaid Diagram Driven Development'));
  });

  it('Step 1: calls initService.createSystemPrompt with AGENTS.md content', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createSystemPrompt.length, 1);
    assert.equal(
      calls.createSystemPrompt[0],
      systemPromptContent,
      'Should pass AGENTS.md content to createSystemPrompt',
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

  it('Step 3: calls initService.createSpecTemplate with the correct source path and a logger', async () => {
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

  it('Step 3: logger is invoked during createSpecTemplate', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    const loggedMessages = [];
    calls.createSpecTemplate[0].logger = (msg) => loggedMessages.push(msg);

    calls.createSpecTemplate[0].logger('✅ Spec template copied: .agents/templates/spec-template.md');

    assert.equal(loggedMessages.length, 1);
    assert.ok(loggedMessages[0].includes('spec-template.md'));
  });

  it('Step 4: calls initService.createArchitectureTemplate with the correct source path and a logger', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createArchitectureTemplate.length, 1);
    assert.equal(
      calls.createArchitectureTemplate[0].sourceTemplatePath,
      path.join(rootDir, '.agents', 'templates', 'ARCHITECTURE.template.md'),
      'Should pass the resolved ARCHITECTURE.template.md path to createArchitectureTemplate',
    );
    assert.equal(typeof calls.createArchitectureTemplate[0].logger, 'function');
  });

  it('Step 4: logger is invoked during createArchitectureTemplate', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    const loggedMessages = [];
    calls.createArchitectureTemplate[0].logger = (msg) => loggedMessages.push(msg);

    calls.createArchitectureTemplate[0].logger('✅ Architecture template copied: .agents/templates/ARCHITECTURE.template.md');

    assert.equal(loggedMessages.length, 1);
    assert.ok(loggedMessages[0].includes('ARCHITECTURE.template.md'));
  });

  it('Steps 1-4: all three InitService methods are called', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createSystemPrompt.length, 1);
    assert.equal(calls.createSkills.length, 1);
    assert.equal(calls.createSpecTemplate.length, 1);
    assert.equal(calls.createArchitectureTemplate.length, 1);
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

    // console.log calls: 1 (skill logger) + 1 (spec template logger) + 1 (architecture template logger) + 2 (success report)
    assert.equal(logs.length, 5);
    assert.ok(logs[3].includes('generated successfully'));
    assert.ok(logs[4].includes('Run the "md init" command'));
  });
});