/**
 * Validates that a .spec.md file exists before processing.
 */
export class SpecValidator {
  /** @type {import('./FileSystemService.js').FileSystemService} */
  #fs;

  /**
   * @param {import('./FileSystemService.js').FileSystemService} fsService
   */
  constructor(fsService) {
    this.#fs = fsService;
  }

  /**
   * Validates that a spec file path exists.
   * @param {string} specFilePath
   * @returns {boolean} true if valid
   * @throws {Error} if file does not exist
   */
  validate(specFilePath) {
    if (!this.#fs.existsSync(specFilePath)) {
      throw new Error(`Specification file not found: ${specFilePath}`);
    }
    return true;
  }
}