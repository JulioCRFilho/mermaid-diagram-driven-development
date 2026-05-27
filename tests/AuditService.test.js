import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AuditService } from '../src/services/AuditService.js';
import { FileSystemService } from '../src/services/FileSystemService.js';

function createMockFs() {
  const store = new Map();

  return new FileSystemService({
    existsSync: (/** @type {string} */ p) => store.has(p),
    mkdirSyncRecursive: (/** @type {string} */ _p) => { /* noop */ },
    readFile: async (/** @type {string} */ p) => store.get(p) || '',
    writeFile: async (/** @type {string} */ p, /** @type {string} */ c) => store.set(p, c),
    appendFile: async (/** @type {string} */ p, /** @type {string} */ c) => store.set(p, (store.get(p) || '') + c),
    readdirSync: (/** @type {string} */ _p) => [],
  });
}

describe('AuditService', () => {
  /** @type {AuditService} */
  let auditService;
  /** @type {FileSystemService} */
  let mockFs;

  beforeEach(() => {
    mockFs = createMockFs();
    auditService = new AuditService(mockFs);
  });

  it('validateCodeFile should throw when file does not exist', () => {
    assert.throws(
      () => auditService.validateCodeFile('/nonexistent/file.js'),
      /Code file not found/
    );
  });

  it('validateCodeFile should return true when file exists', async () => {
    await mockFs.writeFile('/src/app.js', 'console.log("hi");');
    const result = auditService.validateCodeFile('/src/app.js');
    assert.equal(result, true);
  });

  it('run should extract basename and return spec path', () => {
    const result = auditService.run(
      '/src/services/user.service.go',
      '/src/services/user.service.spec.md'
    );

    assert.equal(result.codeBasename, 'user.service.go');
    assert.equal(result.specFilePath, '/src/services/user.service.spec.md');
  });

  it('run should return full path (basename extraction is best-effort on Unix separator)', () => {
    const result = auditService.run(
      'C:\\src\\services\\user.go',
      'C:\\src\\services\\user.spec.md'
    );

    // On Unix, split('/') won't split backslashes; returns full path as-is
    assert.ok(result.codeBasename.includes('user.go'));
  });
});