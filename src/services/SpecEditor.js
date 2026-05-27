/**
 * Handles the `md edit` command business logic.
 */
export class SpecEditor {
  /** @type {import('./FileSystemService.js').FileSystemService} */
  #fs;

  /**
   * @param {import('./FileSystemService.js').FileSystemService} fsService
   */
  constructor(fsService) {
    this.#fs = fsService;
  }

  /**
   * Validates that a spec file exists.
   * @param {string} specFilePath
   * @returns {boolean}
   * @throws {Error} if not found
   */
  validateSpec(specFilePath) {
    if (!this.#fs.existsSync(specFilePath)) {
      throw new Error(`Specification file not found: ${specFilePath}`);
    }
    return true;
  }

  /**
   * Prepares the edit instruction message (placeholder — actual logic applied by AI agent).
   * @param {string} specFilePath
   * @param {string} instruction
   * @returns {{ specFilePath: string, instruction: string }}
   */
  prepareInstruction(specFilePath, instruction) {
    return { specFilePath, instruction };
  }
}