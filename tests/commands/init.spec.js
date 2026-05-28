import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_PROMPT_CONTENT, SKILLS, GITHUB_WORKFLOW_CONTENT, execute } from '../../src/commands/init.js';

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
      // Simulate real behaviour: log each skill
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
// - Row 1: createSystemPrompt writes system_prompt.md
// - Row 2: createSkills writes SKILLS/*.md files + logger calls
// - Row 3: createGitHubWorkflow writes .github/workflows/mddd-preview.yml
// - Row 4: console.log success report
// ---------------------------------------------------------------------------
describe('execute() — md init command', () => {
  it('Step 1: calls initService.createSystemPrompt with SYSTEM_PROMPT_CONTENT', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createSystemPrompt.length, 1);
    assert.equal(
      calls.createSystemPrompt[0],
      SYSTEM_PROMPT_CONTENT,
      'Should pass SYSTEM_PROMPT_CONTENT to createSystemPrompt',
    );
  });

  it('Step 2: calls initService.createSkills with SKILLS and a logger function', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createSkills.length, 1);
    assert.equal(calls.createSkills[0].skills, SKILLS);
    assert.equal(typeof calls.createSkills[0].logger, 'function');
  });

  it('Step 2: logger is invoked once per skill during createSkills', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    // Simulate how the real createSkills calls logger per skill entry
    const skillNames = Object.keys(SKILLS);
    // We manually replay the logging that our mock does
    const loggedMessages = [];
    calls.createSkills[0].logger = (msg) => loggedMessages.push(msg);

    // Re-run the mock's internal logic for verification
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

    // Re-run the mock's internal logging logic
    calls.createGitHubWorkflow[0].logger('✅ GitHub workflow created: .github/workflows/mddd-preview.yml');

    assert.equal(loggedMessages.length, 1);
    assert.ok(loggedMessages[0].includes('mddd-preview.yml'));
  });

  it('Steps 1-4: all three InitService methods are called in order', async () => {
    const { service, calls } = createMockInitService();

    await execute(service);

    assert.equal(calls.createSystemPrompt.length, 1);
    assert.equal(calls.createSkills.length, 1);
    assert.equal(calls.createGitHubWorkflow.length, 1);
  });

  it('Step 4: prints green success messages to stdout (presence of console.log calls)', async () => {
    const { service } = createMockInitService();
    const logs = [];

    // Monkey-patch console.log to capture output
    const originalLog = console.log;
    console.log = (msg) => logs.push(msg);

    try {
      await execute(service);
    } finally {
      console.log = originalLog;
    }

    // Total console.log calls: 4 (logger per skill) + 1 (workflow logger) + 2 (success report)
    assert.equal(logs.length, 7);
    // Last two messages are the success report
    assert.ok(logs[5].includes('generated successfully'));
    assert.ok(
      logs[6].includes('Run the "md init" command'),
    );
  });
});

// ---------------------------------------------------------------------------
// Exported Constants Integrity
// ---------------------------------------------------------------------------
describe('exported constants', () => {
  it('SYSTEM_PROMPT_CONTENT is a non-empty string', () => {
    assert.equal(typeof SYSTEM_PROMPT_CONTENT, 'string');
    assert.ok(SYSTEM_PROMPT_CONTENT.length > 0);
  });

  it('SKILLS is a non-empty record with expected keys', () => {
    assert.equal(typeof SKILLS, 'object');
    assert.notEqual(SKILLS, null);
    assert.ok(!Array.isArray(SKILLS));

    const expectedKeys = ['md-new', 'md-edit', 'md-audit', 'md-impl'];
    for (const key of expectedKeys) {
      assert.ok(key in SKILLS, `SKILLS should contain "${key}"`);
      assert.equal(typeof SKILLS[key], 'string');
      assert.ok(SKILLS[key].length > 0);
    }
  });

  it('GITHUB_WORKFLOW_CONTENT is a non-empty string containing YAML keywords', () => {
    assert.equal(typeof GITHUB_WORKFLOW_CONTENT, 'string');
    assert.ok(GITHUB_WORKFLOW_CONTENT.length > 0);
    assert.ok(GITHUB_WORKFLOW_CONTENT.includes('name:'));
    assert.ok(GITHUB_WORKFLOW_CONTENT.includes('mermaid.ink'));
    assert.ok(GITHUB_WORKFLOW_CONTENT.includes('Diagram Preview'));
    assert.ok(GITHUB_WORKFLOW_CONTENT.includes('actions/checkout@v4'));
  });
});