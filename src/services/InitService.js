import fs from 'node:fs';
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
   * Copies all real skill folders and files to .agents/skills/.
   * @param {string} sourceSkillsDir - Absolute path to the CLI source skills template folder
   * @param {(message: string) => void} logger
   * @returns {Promise<void>}
   */
  async createSkills(sourceSkillsDir, logger) {
    const agentsDir = '.agents';
    const targetSkillsDir = path.join(agentsDir, 'skills');

    // Garante a existência da árvore de diretórios base no destino
    this.#fs.ensureDir(agentsDir);
    this.#fs.ensureDir(targetSkillsDir);

    if (!fs.existsSync(sourceSkillsDir)) {
      throw new Error(`Source skills template directory not found at: ${sourceSkillsDir}`);
    }

    // Copia de forma real, recursiva e idêntica todas as pastas de skills
    // Mantém estruturas complexas como a da sua skill 'mermaid-diagrams' (com subpastas references/, readme.md, etc)
    fs.cpSync(sourceSkillsDir, targetSkillsDir, {
      recursive: true,
      force: true
    });

    // Lista as pastas copiadas apenas para dar um feedback limpo no console
    const copiedSkills = fs.readdirSync(targetSkillsDir);
    for (const skillName of copiedSkills) {
      if (fs.statSync(path.join(targetSkillsDir, skillName)).isDirectory()) {
        logger(`✅ Skill successfully encapsulated: ${path.join(targetSkillsDir, skillName)}`);
      }
    }
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

  /**
   * Copies the spec template file from the CLI package to the project's .agents/templates/ directory.
   * @param {string} sourceTemplatePath - Absolute path to the CLI source spec-template.md
   * @param {(message: string) => void} logger
   * @returns {Promise<void>}
   */
  async createSpecTemplate(sourceTemplatePath, logger) {
    const templatesDir = path.join('.agents', 'templates');
    const targetFile = path.join(templatesDir, 'spec-template.md');

    if (!fs.existsSync(sourceTemplatePath)) {
      throw new Error(`Source spec template not found at: ${sourceTemplatePath}`);
    }

    this.#fs.ensureDir(templatesDir);

    const content = fs.readFileSync(sourceTemplatePath, 'utf-8');
    await this.#fs.writeFile(targetFile, content);
    logger(`✅ Spec template copied: ${targetFile}`);
  }

  /**
   * Copies the ARCHITECTURE template (used by the `mddd-context-map` skill)
   * to the project's .agents/templates/ directory.
   * @param {string} sourceTemplatePath - Absolute path to the CLI source ARCHITECTURE.template.md
   * @param {(message: string) => void} logger
   * @returns {Promise<void>}
   */
  async createArchitectureTemplate(sourceTemplatePath, logger) {
    const templatesDir = path.join('.agents', 'templates');
    const targetFile = path.join(templatesDir, 'ARCHITECTURE.template.md');

    if (!fs.existsSync(sourceTemplatePath)) {
      throw new Error(`Source architecture template not found at: ${sourceTemplatePath}`);
    }

    this.#fs.ensureDir(templatesDir);

    const content = fs.readFileSync(sourceTemplatePath, 'utf-8');
    await this.#fs.writeFile(targetFile, content);
    logger(`✅ Architecture template copied: ${targetFile}`);
  }
}
