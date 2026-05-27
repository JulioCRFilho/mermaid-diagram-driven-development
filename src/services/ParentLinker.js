import path from 'node:path';

/**
 * Crawls directories upward to find the nearest parent macro .spec.md file.
 */
export class ParentLinker {
  /** @type {import('./FileSystemService.js').FileSystemService} */
  #fs;

  /**
   * @param {import('./FileSystemService.js').FileSystemService} fsService
   */
  constructor(fsService) {
    this.#fs = fsService;
  }

  /**
   * Searches for the closest macro (*.spec.md) by recursively traversing the directory tree upward.
   * Skips the spec file that matches the current folder name to avoid self-linking.
   * @param {string} currentDir - Absolute path of the feature directory
   * @returns {string|null} Path to the parent .spec.md, or null if not found
   */
  findClosestMacro(currentDir) {
    let dir = path.resolve(currentDir);
    const root = path.parse(dir).root;

    while (dir !== root) {
      try {
        const files = this.#fs.readdirSync(dir);
        const macroFile = files.find(
          (f) => f.endsWith('.spec.md') && f !== `${path.basename(currentDir)}.spec.md`
        );

        if (macroFile) {
          return path.join(dir, macroFile);
        }
      } catch (e) {
        // Permission errors: stop climbing and return null
        if (e.code === 'EACCES' || e.code === 'EPERM') {
          break;
        }
        throw e;
      }

      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return null;
  }

  /**
   * Appends a markdown link to the child spec into the parent spec file.
   * @param {string} parentSpecPath - Path to the parent .spec.md
   * @param {string} childSpecPath - Path to the child .spec.md
   * @param {string} folderName - Name of the child feature folder
   * @returns {Promise<void>}\n   */
  async linkToParent(parentSpecPath, childSpecPath, folderName) {
    const relativePath = path
      .relative(path.dirname(parentSpecPath), childSpecPath)
      .replace(/\\/g, '/'); // Garante compatibilidade de paths no estilo POSIX para o Markdown

    const parentContent = await this.#fs.readFile(parentSpecPath);

    // Injeta o link logo após o fim do bloco do Mermaid ou no topo do arquivo estruturado
    const linkAddition = `\n\n- [Micro Feature: ${folderName}](${relativePath})`;

    await this.#fs.writeFile(parentSpecPath, parentContent + linkAddition);
  }
}