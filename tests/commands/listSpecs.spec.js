import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import { SpecFinderService } from '../../src/services/SpecFinderService.js';
import { execute as listSpecsExecute } from '../../src/commands/listSpecs.js';

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(currentFile, '..', '..');

function createTempProject() {
  const tempDir = fs.mkdtempSync(path.join(fs.realpathSync('/tmp'), 'mddd-list-specs-'));
  fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
  fs.mkdirSync(path.join(tempDir, '.git'), { recursive: true });
  fs.mkdirSync(path.join(tempDir, 'node_modules'), { recursive: true });
  fs.writeFileSync(path.join(tempDir, 'root.spec.md'), '# root spec');
  fs.writeFileSync(path.join(tempDir, 'src', 'child.spec.md'), '# child spec');
  fs.writeFileSync(path.join(tempDir, '.git', 'ignored.spec.md'), '# ignored');
  fs.writeFileSync(path.join(tempDir, 'node_modules', 'ignored.spec.md'), '# ignored');
  return tempDir;
}

describe('SpecFinderService', () => {
  it('finds all .spec.md files and ignores blacklisted directories', () => {
    const tempDir = createTempProject();
    const service = new SpecFinderService();
    const specs = service.findSpecs(tempDir);

    assert.deepEqual(specs.sort(), ['root.spec.md', 'src/child.spec.md']);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

describe('listSpecs command', () => {
  it('prints JSON with specs', async () => {
    const tempDir = createTempProject();
    const service = new SpecFinderService();
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    const captured = [];
    const originalLog = console.log;
    console.log = (value) => captured.push(value);

    try {
      await listSpecsExecute(service);
    } finally {
      console.log = originalLog;
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    assert.equal(captured.length, 1);
    const output = JSON.parse(captured[0]);
    assert.deepEqual(output.specs.sort(), ['root.spec.md', 'src/child.spec.md']);
  });
});
