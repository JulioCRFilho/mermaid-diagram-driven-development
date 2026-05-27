// @ts-check
import fs from 'node:fs/promises';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';

/**
 * @typedef {Object} FileSystemOperations
 * @property {(path: string) => Promise<string>} readFile
 * @property {(path: string, content: string) => Promise<void>} writeFile
 * @property {(path: string, content: string) => Promise<void>} appendFile
 * @property {(path: string) => boolean} existsSync
 * @property {(path: string) => void} mkdirSyncRecursive
 * @property {(path: string) => string[]} readdirSync
 */

/**
 * Shared file system service with dependency injection support for testability.
 */
export class FileSystemService {
  /** @type {FileSystemOperations} */
  #fs;

  /**
   * @param {Partial<FileSystemOperations>} [fsMock] - Optional mock for testing
   */
  constructor(fsMock) {
    this.#fs = {
      readFile: fsMock?.readFile || fs.readFile.bind(fs),
      writeFile: fsMock?.writeFile || fs.writeFile.bind(fs),
      appendFile: fsMock?.appendFile || fs.appendFile.bind(fs),
      existsSync: fsMock?.existsSync || existsSync,
      mkdirSyncRecursive: fsMock?.mkdirSyncRecursive || ((p) => mkdirSync(p, { recursive: true })),
      readdirSync: fsMock?.readdirSync || readdirSync,
    };
  }

  /**
   * Checks if a path exists synchronously.
   * @param {string} path
   * @returns {boolean}
   */
  existsSync(path) {
    return this.#fs.existsSync(path);
  }

  /**
   * Creates a directory recursively.
   * @param {string} path
   */
  mkdirSyncRecursive(path) {
    this.#fs.mkdirSyncRecursive(path);
  }

  /**
   * Creates a directory if it doesn't exist.
   * @param {string} path
   */
  ensureDir(path) {
    if (!this.#fs.existsSync(path)) {
      this.#fs.mkdirSyncRecursive(path);
    }
  }

  /**
   * Reads a file as UTF-8 string.
   * @param {string} path
   * @returns {Promise<string>}
   */
  async readFile(path) {
    return this.#fs.readFile(path);
  }

  /**
   * Writes a string to a file.
   * @param {string} path
   * @param {string} content
   * @returns {Promise<void>}
   */
  async writeFile(path, content) {
    return this.#fs.writeFile(path, content);
  }

  /**
   * Appends content to a file.
   * @param {string} path
   * @param {string} content
   * @returns {Promise<void>}
   */
  async appendFile(path, content) {
    return this.#fs.appendFile(path, content);
  }

  /**
   * Synchronous readdir for directory crawling.
   * @param {string} dir
   * @returns {string[]}
   */
  readdirSync(dir) {
    return this.#fs.readdirSync(dir);
  }
}