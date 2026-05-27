/**
 * Validates prerequisites for the `md impl` command.
 */
export class ImplValidator {
  /** @type {import('./FileSystemService.js').FileSystemService} */
  #fs;

  /**
   * @param {import('./FileSystemService.js').FileSystemService} fsService
   */
  constructor(fsService) {
    this.#fs = fsService;
  }

  /**
   * Validates that a spec file exists before implementation.
   * @param {string} specFilePath
   * @returns {boolean}
   * @throws {Error} if not found
   */
  validate(specFilePath) {
    if (!this.#fs.existsSync(specFilePath)) {
      throw new Error(`Specification file not found: ${specFilePath}`);
    }
    return true;
  }
}