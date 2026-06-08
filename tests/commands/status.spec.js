import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { SpecFinderService } from '../../src/services/SpecFinderService.js';
import { execute as statusExecute } from '../../src/commands/status.js';

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(currentFile, '..', '..');

/**
 * Creates a temporary project directory with test .spec.md files.
 * @param {Array<{relativePath: string, content: string}>} specs
 * @returns {string} tempDir path
 */
function createTempProject(specs) {
  const tempDir = fs.mkdtempSync(path.join(fs.realpathSync('/tmp'), 'mddd-status-'));
  fs.mkdirSync(path.join(tempDir, '.git'), { recursive: true });
  fs.mkdirSync(path.join(tempDir, 'node_modules'), { recursive: true });

  for (const spec of specs) {
    const fullPath = path.join(tempDir, spec.relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, spec.content);
  }

  return tempDir;
}

/**
 * Creates a complete spec with Tasks and Audit History.
 * @param {Object} options
 * @param {number} [options.tasksPending=0]
 * @param {number} [options.tasksCompleted=0]
 * @param {number} [options.totalChanges=0]
 * @param {number} [options.majors=0]
 * @param {number} [options.minors=0]
 * @param {number} [options.patches=0]
 * @param {string[]} [options.changeSummaries=[]]
 * @param {'draft'|'stable'} [options.status='draft']
 * @param {string} [options.classification]
 * @param {string} [options.version='1.0.0']
 * @returns {string} markdown content
 */
function createSpecContent(options = {}) {
  const {
    tasksPending = 0,
    tasksCompleted = 0,
    totalChanges = 0,
    majors = 0,
    minors = 0,
    patches = 0,
    changeSummaries = [],
    status = 'draft',
    classification,
    version = '1.0.0'
  } = options;

  // Build tasks
  let tasksSection = '';
  if (tasksPending > 0 || tasksCompleted > 0) {
    const items = [];
    for (let i = 0; i < tasksCompleted; i++) items.push(`- [x] Completed task ${i + 1}`);
    for (let i = 0; i < tasksPending; i++) items.push(`- [ ] Pending task ${i + 1}`);
    tasksSection = `## Tasks\n\n${items.join('\n')}\n`;
  }

  // Build audit history
  let auditSection = '';
  if (totalChanges > 0) {
    const rows = [];
    for (let i = 0; i < majors; i++) {
      const summary = changeSummaries[i] || `MAJOR change ${i + 1}`;
      rows.push(`| 2026-06-0${(i % 9) + 1} | Cline | v${version} | ${summary} | MAJOR |`);
    }
    const minorStart = majors;
    for (let i = 0; i < minors; i++) {
      const idx = minorStart + i;
      const summary = changeSummaries[idx] || `MINOR change ${i + 1}`;
      rows.push(`| 2026-06-0${(idx % 9) + 1} | Cline | v${version} | ${summary} | MINOR |`);
    }
    const patchStart = majors + minors;
    for (let i = 0; i < patches; i++) {
      const idx = patchStart + i;
      const summary = changeSummaries[idx] || `PATCH change ${i + 1}`;
      rows.push(`| 2026-06-0${(idx % 9) + 1} | Cline | v${version} | ${summary} | PATCH |`);
    }
    auditSection = `## Audit History\n\n| Date | Agent | Version | Change Summary | Change Type |\n| :--- | :--- | :---: | :--- | :---: |\n${rows.join('\n')}\n`;
  }

  // Build classification line
  let classificationLine = '';
  if (classification) {
    classificationLine = `Classificado como **${classification}**`;
  }

  return `# Test Spec

**SPEC_VERSION: v${version} — ${status}**

${classificationLine}

## Overview

Test spec for status command.

${tasksSection}
${auditSection}
`;
}

describe('md status command', () => {
  it('returns empty summary when no .spec.md files exist', async () => {
    const tempDir = fs.mkdtempSync(path.join(fs.realpathSync('/tmp'), 'mddd-status-empty-'));
    fs.mkdirSync(path.join(tempDir, '.git'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'node_modules'), { recursive: true });

    const service = new SpecFinderService();
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    const captured = [];
    const originalLog = console.log;
    console.log = (value) => captured.push(value);

    try {
      const result = await statusExecute(service);
      assert.equal(result.totalSpecs, 0);
      assert.equal(result.totalTasks, 0);
      assert.equal(result.totalChanges, 0);
      assert.equal(result.criticalPoints.length, 0);
      assert.ok(captured.some(c => typeof c === 'string' && c.includes('No .spec.md files')));
    } finally {
      console.log = originalLog;
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('aggregates metrics from multiple specs with tasks and audit history', async () => {
    const spec1 = createSpecContent({
      tasksPending: 2,
      tasksCompleted: 3,
      totalChanges: 4,
      majors: 1,
      minors: 2,
      patches: 1,
      changeSummaries: [
        'Major refactor of core module',
        'Added discovery for edge case',
        'Minor improvement to validation',
        'Fixed bug in parser'
      ],
      status: 'stable',
      classification: 'Coeso',
      version: '2.0.0'
    });

    const spec2 = createSpecContent({
      tasksPending: 5,
      tasksCompleted: 1,
      totalChanges: 2,
      majors: 0,
      minors: 1,
      patches: 1,
      changeSummaries: [
        'Documentation update for README',
        'Fix broken config parsing'
      ],
      status: 'draft',
      classification: 'Caótico',
      version: '1.0.0'
    });

    const tempDir = createTempProject([
      { relativePath: 'src/spec1.spec.md', content: spec1 },
      { relativePath: 'bin/spec2.spec.md', content: spec2 }
    ]);

    const service = new SpecFinderService();
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    const captured = [];
    const originalLog = console.log;
    console.log = (value) => captured.push(value);

    try {
      const result = await statusExecute(service);

      // Total specs
      assert.equal(result.totalSpecs, 2);

      // Classification counts
      assert.equal(result.coesoCount, 1);
      assert.equal(result.caoticoCount, 1);
      assert.equal(result.unclassifiedCount, 0);

      // Tasks: spec1 has 5 total (3 completed + 2 pending), spec2 has 6 (1 completed + 5 pending)
      assert.equal(result.totalTasks, 11);
      assert.equal(result.completedTasks, 4);
      assert.equal(result.pendingTasks, 7);

      // Changes: spec1 has 4, spec2 has 2
      assert.equal(result.totalChanges, 6);

      // Breakdown: spec1 (1 major, 2 minor, 1 patch) + spec2 (0 major, 1 minor, 1 patch)
      assert.equal(result.totalMajors, 1);
      assert.equal(result.totalMinors, 3);
      assert.equal(result.totalPatches, 2);

      // Change types:
      // spec1: "refactor" → refactor, "discovery" → discovery, "improvement" → improvement, "bug" → fix
      // spec2: "documentation" → documentation, "fix" → fix
      assert.equal(result.totalDiscoveries, 1);
      assert.equal(result.totalFixes, 2);
      assert.equal(result.totalImprovements, 1);
      assert.equal(result.totalDocumentation, 1);
      assert.equal(result.totalRefactors, 1);

      // Critical points: spec2 has 5 pending tasks (> 5 triggers warning? 5 is not > 5)
      // spec2 is draft → critical point for draft status
      // spec2 is Caótico → critical point
      // No spec has 0 changes (spec1 has 4, spec2 has 2)
      assert.ok(result.criticalPoints.some(p => p.includes('CAÓTICO')));
      assert.ok(result.criticalPoints.some(p => p.includes('DRAFT')));
      // spec2 has 5 pending tasks, threshold is > 5, so no pending warning
      // But spec2 has 5 which is not > 5, so no warning for that
    } finally {
      console.log = originalLog;
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('handles specs with no Tasks section', async () => {
    const spec = `# Minimal Spec
**SPEC_VERSION: v1.0.0 — draft**

## Overview

No tasks here.
`;

    const tempDir = createTempProject([
      { relativePath: 'minimal.spec.md', content: spec }
    ]);

    const service = new SpecFinderService();
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    const captured = [];
    const originalLog = console.log;
    console.log = (value) => captured.push(value);

    try {
      const result = await statusExecute(service);
      assert.equal(result.totalSpecs, 1);
      assert.equal(result.totalTasks, 0);
      assert.equal(result.totalChanges, 0);
      assert.equal(result.coesoCount, 0);
      assert.equal(result.caoticoCount, 0);
      assert.equal(result.unclassifiedCount, 1);
    } finally {
      console.log = originalLog;
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('detects critical points for specs with many pending tasks', async () => {
    const spec = createSpecContent({
      tasksPending: 10,
      tasksCompleted: 1,
      status: 'draft',
      version: '1.0.0'
    });

    const tempDir = createTempProject([
      { relativePath: 'src/big.spec.md', content: spec }
    ]);

    const service = new SpecFinderService();
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    const captured = [];
    const originalLog = console.log;
    console.log = (value) => captured.push(value);

    try {
      const result = await statusExecute(service);
      assert.equal(result.totalSpecs, 1);
      assert.equal(result.totalTasks, 11);
      // 10 pending > 5 threshold
      assert.ok(result.criticalPoints.some(p => p.includes('10 pending tasks')));
      assert.ok(result.criticalPoints.some(p => p.includes('DRAFT')));
      // No Audit History (0 changes) → critical point
      assert.ok(result.criticalPoints.some(p => p.includes('No Audit History')));
    } finally {
      console.log = originalLog;
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('classifies change types correctly from summaries', async () => {
    // Test the classifyChangeType function indirectly through analyzeSpec
    // by creating specs with specific change summaries
    const spec = createSpecContent({
      totalChanges: 6,
      majors: 0,
      minors: 0,
      patches: 6,
      changeSummaries: [
        'Discovery of new edge case in auth flow',
        'Fix memory leak in parser',
        'Improvement to validation speed',
        'Documentation added for config',
        'Refactor of core module structure',
        'Random update with no keywords'
      ],
      version: '1.0.0',
      status: 'stable'
    });

    const tempDir = createTempProject([
      { relativePath: 'classify.spec.md', content: spec }
    ]);

    const service = new SpecFinderService();
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    const captured = [];
    const originalLog = console.log;
    console.log = (value) => captured.push(value);

    try {
      const result = await statusExecute(service);
      assert.equal(result.totalDiscoveries, 1);
      assert.equal(result.totalFixes, 1);
      assert.equal(result.totalImprovements, 1);
      assert.equal(result.totalDocumentation, 1);
      assert.equal(result.totalRefactors, 1);
      // "Random update with no keywords" classifies as "other"
      // But we don't have an "other" counter in the summary
      // The total changes is 6, but our classified types sum to 5
      // The 6th is "other" which isn't tracked
    } finally {
      console.log = originalLog;
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});