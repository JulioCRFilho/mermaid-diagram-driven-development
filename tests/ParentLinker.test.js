import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ParentLinker } from '../src/services/ParentLinker.js';
import { FileSystemService } from '../src/services/FileSystemService.js';

/**
 * Creates a mocked FileSystemService for isolated testing.
 */
function createMockFs(initialFiles = {}) {
  const store = new Map(Object.entries(initialFiles));

  return new FileSystemService({
    existsSync: (/** @type {string} */ p) => store.has(p),
    mkdirSyncRecursive: (/** @type {string} */ _p) => { /* noop */ },
    readFile: async (/** @type {string} */ p) => store.get(p) || '',
    writeFile: async (/** @type {string} */ p, /** @type {string} */ c) => store.set(p, c),
    appendFile: async (/** @type {string} */ p, /** @type {string} */ c) =>
      store.set(p, (store.get(p) || '') + c),
    readdirSync: (/** @type {string} */ dir) => {
      const entries = [];
      for (const key of store.keys()) {
        if (key.startsWith(dir) && key !== dir) {
          const relative = key.slice(dir.length + 1);
          const top = relative.split('/')[0];
          if (!entries.includes(top)) entries.push(top);
        }
      }
      // Also include spec files that are direct children
      for (const key of store.keys()) {
        if (key.startsWith(dir + '/') && key.endsWith('.spec.md')) {
          const basename = key.split('/').pop();
          if (!entries.includes(basename)) entries.push(basename);
        }
      }
      return entries;
    },
  });
}

describe('ParentLinker', () => {
  /** @type {ParentLinker} */
  let linker;

  beforeEach(() => {
    // noop
  });

  it('findClosestMacro should return null when no parent spec exists', () => {
    const mockFs = createMockFs();
    linker = new ParentLinker(mockFs);

    const result = linker.findClosestMacro('/test/domain/feature');
    assert.equal(result, null);
  });

  it('findClosestMacro should find parent spec in parent directory', () => {
    const mockFs = createMockFs({
      '/test/domain/domain.spec.md': '# Domain Macro',
    });
    linker = new ParentLinker(mockFs);

    const result = linker.findClosestMacro('/test/domain/feature');
    assert.equal(result, '/test/domain/domain.spec.md');
  });

  it('findClosestMacro should skip self-named spec file', () => {
    const mockFs = createMockFs({
      '/test/domain/feature/feature.spec.md': '# Feature spec',
      '/test/domain/domain.spec.md': '# Domain Macro',
    });
    linker = new ParentLinker(mockFs);

    const result = linker.findClosestMacro('/test/domain/feature');
    assert.equal(result, '/test/domain/domain.spec.md', 'Should skip feature.spec.md and find domain.spec.md');
  });

  it('findClosestMacro should climb multiple directories', () => {
    const mockFs = createMockFs({
      '/test/test.spec.md': '# Root Macro',
    });
    linker = new ParentLinker(mockFs);

    const result = linker.findClosestMacro('/test/domain/deep/nested/feature');
    assert.equal(result, '/test/test.spec.md');
  });

  it('findClosestMacro should handle permission errors gracefully', () => {
    // Create a mock FS with readdirSync that throws EACCES
    const failingFs = new FileSystemService({
      existsSync: () => false,
      mkdirSyncRecursive: () => {},
      readFile: async () => '',
      writeFile: async () => {},
      appendFile: async () => {},
      readdirSync: () => { const e = new Error('EACCES'); e.code = 'EACCES'; throw e; },
    });
    linker = new ParentLinker(failingFs);

    const result = linker.findClosestMacro('/test/domain/feature');
    assert.equal(result, null);
  });

  it('linkToParent should append markdown link', async () => {
    const store = new Map();
    store.set('/parent/dir/parent.spec.md', '# Parent');

    const mockFs = new FileSystemService({
      existsSync: (/** @type {string} */ p) => store.has(p),
      mkdirSyncRecursive: (/** @type {string} */ _p) => { /* noop */ },
      readFile: async (/** @type {string} */ p) => store.get(p) || '',
      writeFile: async (/** @type {string} */ p, /** @type {string} */ c) => store.set(p, c),
      appendFile: async (/** @type {string} */ p, /** @type {string} */ c) =>
        store.set(p, (store.get(p) || '') + c),
      readdirSync: (/** @type {string} */ _p) => [],
    });
    linker = new ParentLinker(mockFs);

    await linker.linkToParent(
      '/parent/dir/parent.spec.md',
      '/parent/dir/child/child.spec.md',
      'child'
    );

    const content = store.get('/parent/dir/parent.spec.md');
    assert.ok(content.includes('[Go to child rules]'));
    assert.ok(content.includes('child/child.spec.md'));
  });
});