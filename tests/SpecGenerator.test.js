import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SpecGenerator } from '../src/services/SpecGenerator.js';
import { FileSystemService } from '../src/services/FileSystemService.js';

/**
 * Creates a mocked FileSystemService for isolated testing.
 */
function createMockFs() {
  const store = new Map();

  return new FileSystemService({
    existsSync: (/** @type {string} */ p) => store.has(p),
    mkdirSyncRecursive: (/** @type {string} */ p) => store.set(p, ''),
    readFile: async (/** @type {string} */ p) => store.get(p) || '',
    writeFile: async (/** @type {string} */ p, /** @type {string} */ c) => store.set(p, c),
    appendFile: async (/** @type {string} */ p, /** @type {string} */ c) =>
      store.set(p, (store.get(p) || '') + c),
    readdirSync: (/** @type {string} */ _p) => [],
  });
}

describe('SpecGenerator', () => {
  /** @type {FileSystemService} */
  let mockFs;
  /** @type {SpecGenerator} */
  let generator;

  beforeEach(() => {
    mockFs = createMockFs();
    generator = new SpecGenerator(mockFs);
  });

  it('create should generate a macro spec file for macro=true', async () => {
    mockFs.mkdirSyncRecursive('/test/macro-domain');

    const result = await generator.create('/test/macro-domain', true, 'v1.0.0');

    assert.equal(result.folderName, 'macro-domain');
    assert.ok(result.filePath.endsWith('macro-domain.spec.md'));

    const content = await mockFs.readFile(result.filePath);
    assert.ok(content.includes('Macro Module: macro-domain | v1.0.0'));
    assert.ok(content.includes('stateDiagram-v2'));
  });

  it('create should generate a micro spec file for macro=false', async () => {
    mockFs.mkdirSyncRecursive('/test/domain/feature');

    const result = await generator.create('/test/domain/feature', false, 'v1.5.0');

    assert.equal(result.folderName, 'feature');
    assert.ok(result.filePath.endsWith('feature.spec.md'));

    const content = await mockFs.readFile(result.filePath);
    assert.ok(content.includes('Specification: feature | v1.5.0'));
    assert.ok(content.includes('graph LR'));
    assert.ok(content.includes('Decision Matrix'));
  });

  it('create should accept custom version strings', async () => {
    mockFs.mkdirSyncRecursive('/test/app');

    const result = await generator.create('/test/app', false, 'v2.0.0-rc1');
    const content = await mockFs.readFile(result.filePath);
    assert.ok(content.includes('v2.0.0-rc1'));
  });

  it('createIfMissing should create spec when none exists', async () => {
    mockFs.mkdirSyncRecursive('/src/services');

    const result = await generator.createIfMissing('/src/services/user.go');

    assert.ok(result.specFilePath.endsWith('user.spec.md'));
    assert.equal(result.codeBaseName, 'user');

    const content = await mockFs.readFile(result.specFilePath);
    assert.ok(content.includes('Audit: user | v1.0.0'));
  });

  it('createIfMissing should return existing spec without overwriting', async () => {
    mockFs.mkdirSyncRecursive('/src/services');
    const existingContent = '# Custom existing spec content';
    await mockFs.writeFile('/src/services/user.spec.md', existingContent);

    const result = await generator.createIfMissing('/src/services/user.go');

    const content = await mockFs.readFile(result.specFilePath);
    assert.equal(content, existingContent, 'Existing spec must not be overwritten');
  });
});