import fs from 'node:fs';
import path from 'node:path';

const IGNORED_DIRECTORIES = new Set(['node_modules', '.git', '.agents', 'build', 'dist']);
const SPEC_EXTENSION = '.spec.md';

export class SpecFinderService {
  /**
   * Recursively scans the project tree for `.spec.md` files.
   * @param {string} [rootDir=process.cwd()]
   * @returns {string[]}
   */
  findSpecs(rootDir = process.cwd()) {
    const specs = [];

    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (IGNORED_DIRECTORIES.has(entry.name)) {
            continue;
          }

          walk(path.join(dir, entry.name));
          continue;
        }

        if (entry.isFile() && entry.name.endsWith(SPEC_EXTENSION)) {
          const absolutePath = path.join(dir, entry.name);
          const relativePath = path.relative(rootDir, absolutePath).replace(/\\/g, '/');
          specs.push(relativePath);
        }
      }
    };

    walk(rootDir);
    return specs.sort();
  }
}
