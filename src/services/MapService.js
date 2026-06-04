import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';

/**
 * @typedef {Object} MappedSpec
 * @property {string} domain - Uppercase domain name extracted from the file (e.g. "CRM")
 * @property {string} relativePath - Path relative to process.cwd() (e.g. "src/domain/crm.spec.md")
 * @property {string} absolutePath - Resolved absolute path on disk
 */

/**
 * @typedef {Object} FileSystemReader
 * @property {(dir: string, opts?: { withFileTypes?: boolean }) => Promise<import('node:fs').Dirent[]>} readdir
 * @property {(p: string) => Promise<import('node:fs').Stats>} stat
 */

/**
 * Service responsible for scanning the user's project recursively to track
 * co-located `.spec.md` specification files and emit a clean architecture map.
 *
 * Designed to be resilient: any unreadable directory is logged as a warning
 * and the walk continues. No third-party dependencies are used — only Node
 * native modules (`node:fs/promises`, `node:path`) and `picocolors` (already
 * present in the project).
 */
export class MapService {
  /** @type {FileSystemReader} */
  #fs;

  /** @type {string} */
  #rootDir;

  /**
   * Directory names that must be ignored during the recursive walk.
   * Blacklist strategy: prevents stack overflow and keeps the scan fast
   * by skipping heavy / irrelevant trees (deps, VCS, build output, agent
   * boilerplate).
   * @type {Set<string>}
   */
  static #BLACKLIST = new Set([
    'node_modules',
    '.git',
    '.agents',
    'build',
    'dist',
  ]);

  /**
   * @param {Partial<FileSystemReader>} [fsReader] - Optional mock for unit testing.
   * @param {string} [rootDir] - Root directory to scan. Defaults to process.cwd().
   */
  constructor(fsReader, rootDir) {
    this.#fs = {
      readdir: fsReader?.readdir || ((dir, opts) => fs.readdir(dir, opts)),
      stat: fsReader?.stat || ((p) => fs.stat(p)),
    };
    this.#rootDir = rootDir || process.cwd();
  }

  /**
   * Recursively walks the project starting at the configured root and
   * collects every file ending with the `.spec.md` extension.
   *
   * Fail-safe behavior: each `readdir` call is wrapped in a try/catch block.
   * If a directory cannot be read (e.g. permission denied), a yellow warning
   * is emitted via `picocolors.yellow` and the walk proceeds over the
   * remaining siblings.
   *
   * @param {string} [dir] - Internal recursion cursor. Defaults to the root.
   * @returns {Promise<MappedSpec[]>} Resolved list of mapped spec files.
   */
  async #walk(dir = this.#rootDir) {
    /** @type {MappedSpec[]} */
    const collected = [];

    let entries;
    try {
      entries = await this.#fs.readdir(dir, { withFileTypes: true });
    } catch (err) {
      console.warn(
        pc.yellow(
          `⚠️  Could not read directory "${dir}": ${err.message}. Skipping.`
        )
      );
      return collected;
    }

    for (const entry of entries) {
      const absolutePath = path.join(dir, entry.name);

      // Blacklisted directories are pruned at the entry level — no descent.
      if (entry.isDirectory()) {
        if (MapService.#BLACKLIST.has(entry.name)) {
          continue;
        }
        const nested = await this.#walk(absolutePath);
        collected.push(...nested);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (!entry.name.endsWith('.spec.md')) {
        continue;
      }

      collected.push({
        domain: path.basename(absolutePath, '.spec.md').toUpperCase(),
        relativePath: path.relative(process.cwd(), absolutePath),
        absolutePath,
      });
    }

    return collected;
  }

  /**
   * Generates the full architecture map for the current project.
   *
   * - Performs a recursive scan from `process.cwd()` honoring the blacklist.
   * - Emits paths relative to `process.cwd()` for cross-platform consistency.
   * - Extracts the semantic domain name by stripping `.spec.md` and uppercasing.
   * - Prints a colored report to the terminal:
   *     • Red + yellow hint when no specs are found.
   *     • Green total count + per-module block listing when specs exist.
   *
   * @returns {Promise<MappedSpec[]>} The mapped specs (also printed to stdout).
   */
  async generateArchitectureMap() {
    const mapped = await this.#walk();

    if (mapped.length === 0) {
      console.log(
        pc.red('❌ No `.spec.md` files were found mapped in this project.')
      );
      console.log(
        pc.yellow(
          '💡 Tip: run this command from the root of your project, or create a spec file with `md init` to bootstrap the MDDD structure.'
        )
      );
      return mapped;
    }

    console.log(
      pc.green(`✅ ${mapped.length} spec file(s) mapped in the project:\n`)
    );

    mapped.forEach((spec, index) => {
      const moduleNumber = index + 1;
      console.log(
        `[Módulo ${moduleNumber}] ${pc.bold(pc.cyan(spec.domain))}`
      );
      console.log(
        `         📍 Caminho Relativo: ${pc.gray(spec.relativePath)}`
      );
      console.log('');
    });

    return mapped;
  }
}
