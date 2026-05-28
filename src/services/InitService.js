import path from 'node:path';

/**
 * Handles the `md init` business logic: system prompt and skills creation.
 */
export class InitService {
  /** @type {import('./FileSystemService.js').FileSystemService} */
  #fs;

  /**
   * @param {import('./FileSystemService.js').FileSystemService} fsService
   */
  constructor(fsService) {
    this.#fs = fsService;
  }

  /**
   * Creates the universal system prompt file.
   * @param {string} promptContent - The full MDDD system prompt content
   * @returns {Promise<void>}
   */
  async createSystemPrompt(promptContent) {
    await this.#fs.writeFile('system_prompt.md', promptContent);
  }

  /**
   * Creates all skill folders and SKILL.md files.
   * @param {Record<string, string>} skills - Map of skill name to skill content
   * @param {(message: string) => void} logger
   * @returns {Promise<string[]>} Array of file paths created
   */
  async createSkills(skills, logger) {
    const agentsDir = '.agents';
    const skillsDir = path.join(agentsDir, 'skills');

    this.#fs.ensureDir(agentsDir);
    this.#fs.ensureDir(skillsDir);

    const created = [];

    for (const [skillName, content] of Object.entries(skills)) {
      const skillFolder = path.join(skillsDir, skillName);
      this.#fs.ensureDir(skillFolder);

      const skillFile = path.join(skillFolder, 'SKILL.md');
      await this.#fs.writeFile(skillFile, content);
      created.push(skillFile);
      logger(`✅ Skill successfully encapsulated: ${skillFile}`);
    }

    return created;
  }

  /**
   * Creates (or overwrites) the GitHub Actions workflow for Mermaid diagram preview on PRs.
   * @param {string} workflowYaml - The YAML content for the GitHub workflow
   * @param {(message: string) => void} logger
   * @returns {Promise<string>} Path to the created workflow file
   */
  async createGitHubWorkflow(workflowYaml, logger) {
    const workflowsDir = path.join('.github', 'workflows');
    const workflowFile = path.join(workflowsDir, 'mddd-preview.yml');

    this.#fs.ensureDir(workflowsDir);
    await this.#fs.writeFile(workflowFile, workflowYaml);
    logger(`✅ GitHub workflow created: ${workflowFile}`);

    return workflowFile;
  }
}