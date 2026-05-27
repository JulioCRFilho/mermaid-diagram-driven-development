import path from 'node:path';
import { TemplateFactory } from './TemplateFactory.js';

/**
 * Handles .spec.md file generation for `md new` and `md audit` commands.
 */
export class SpecGenerator {
  /** @type {import('./FileSystemService.js').FileSystemService} */
  #fs;

  /**
   * @param {import('./FileSystemService.js').FileSystemService} fsService
   */
  constructor(fsService) {
    this.#fs = fsService;
  }

  /**
   * Creates a new .spec.md file for a feature (macro or micro).
   * @param {string} targetPath - Normalized target directory path
   * @param {boolean} isMacro - Whether to generate a macro template
   * @param {string} version - Semantic version string (e.g. 'v1.0.0')
   * @returns {Promise<{filePath: string, folderName: string}>}
   */
  async create(targetPath, isMacro, version) {
    const folderName = path.basename(targetPath);
    const finalFile = path.join(targetPath, `${folderName}.spec.md`);

    const template = isMacro
      ? TemplateFactory.macroTemplate(folderName, version)
      : TemplateFactory.microTemplate(folderName, version);

    await this.#fs.writeFile(finalFile, template);

    return { filePath: finalFile, folderName };
  }

  /**
   * Creates a missing .spec.md file for audit purposes.
   * @param {string} codeFilePath - Path to the code file being audited
   * @returns {Promise<{specFilePath: string, codeBaseName: string}>}
   */
  async createIfMissing(codeFilePath) {
    const targetDir = path.dirname(codeFilePath);
    const ext = path.extname(codeFilePath);
    const codeBaseName = path.basename(codeFilePath, ext);
    const specFileName = `${codeBaseName}.spec.md`;
    const specFilePath = path.join(targetDir, specFileName);

    if (!this.#fs.existsSync(specFilePath)) {
      const version = 'v1.0.0';
      const template = TemplateFactory.auditTemplate(codeBaseName, version);
      await this.#fs.writeFile(specFilePath, template);
    }

    return { specFilePath, codeBaseName };
  }
}