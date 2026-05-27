/**
 * Handles the `md audit` command business logic.
 */
export class AuditService {
  /** @type {import('./FileSystemService.js').FileSystemService} */
  #fs;

  /**
   * @param {import('./FileSystemService.js').FileSystemService} fsService
   */
  constructor(fsService) {
    this.#fs = fsService;
  }

  /**
   * Validates that a code file exists.
   * @param {string} codeFilePath
   * @returns {boolean}
   * @throws {Error} if not found
   */
  validateCodeFile(codeFilePath) {
    if (!this.#fs.existsSync(codeFilePath)) {
      throw new Error(`Code file not found: ${codeFilePath}`);
    }
    return true;
  }

  /**
   * Runs audit placeholders (actual AI analysis happens in chat via /md-audit skill).
   * @param {string} codeFilePath
   * @param {string} specFilePath
   * @returns {{ codeBasename: string, specFilePath: string }}
   */
  run(codeFilePath, specFilePath) {
    const basename = codeFilePath.split('/').pop() || codeFilePath.split('\\').pop();
    return {
      codeBasename: basename,
      specFilePath,
    };
  }
}