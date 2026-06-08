# InitService — Specification

**SPEC_VERSION: v1.2.0 — stable**

## Overview

The `InitService` class orchestrates the `md init` command business logic: creating the universal system prompt file and the full skill library directory structure. It receives a `FileSystemService` instance via constructor injection — no direct `fs` calls.

Co-located with `src/services/InitService.js`.

---

## Behavioral Flow (Mermaid)

```mermaid
%% @spec-version v1.2.0
stateDiagram-v2
    [*] --> createSystemPrompt: initService.createSystemPrompt(promptContent)
    createSystemPrompt --> writeFile: this.#fs.writeFile('AGENTS.md', content)
    writeFile --> createSkills: initService.createSkills(sourceSkillsDir, logger)

    createSkills --> ensureAgentsDir: this.#fs.ensureDir('.agents')
    ensureAgentsDir --> ensureTargetSkillsDir: this.#fs.ensureDir('.agents/skills')
    ensureTargetSkillsDir --> cpSyncSkills: fs.cpSync(source, target, recursive)
    cpSyncSkills --> logSkills: logger per copied skill
    logSkills --> createGitHubWorkflow: initService.createGitHubWorkflow(workflowYaml, logger)

    createGitHubWorkflow --> ensureWorkflowDir: this.#fs.ensureDir('.github/workflows')
    ensureWorkflowDir --> writeWorkflowFile: this.#fs.writeFile('.github/workflows/mddd-preview.yml', content)
    writeWorkflowFile --> logWorkflow: logger(`✅ GitHub workflow created`)
    logWorkflow --> createSpecTemplate: initService.createSpecTemplate(sourceTemplatePath, logger)

    createSpecTemplate --> ensureTemplatesDir: this.#fs.ensureDir('.agents/templates')
    ensureTemplatesDir --> writeTemplateFile: this.#fs.writeFile('.agents/templates/spec-template.md', content)
    writeTemplateFile --> logTemplate: logger(`✅ Spec template copied`)
    logTemplate --> [*]
```

---

## Decision Matrix

| Step | Method | I/O | Conditional Branch? | Error Handling | FS Side Effect |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 1 | `createSystemPrompt(promptContent)` | Input: `string`<br>Output: `Promise<void>` | ❌ No | Delegated to `#fs.writeFile` | ✅ Writes `AGENTS.md` |
| 2 | `createSkills(sourceSkillsDir, logger)` | Input: `string` (source dir) + logger fn<br>Output: `Promise<void>` | ✅ Checks `fs.existsSync(sourceSkillsDir)` | Throws `Error` if source dir not found | ✅ Creates `.agents/`, `.agents/skills/`, copies all skill folders recursively |
| 3 | `createGitHubWorkflow(workflowYaml, logger)` | Input: `string` + logger fn<br>Output: `Promise<string>` | ❌ No | Delegated to `#fs` methods | ✅ Creates `.github/workflows/mddd-preview.yml` |
| 4 | `createSpecTemplate(sourceTemplatePath, logger)` | Input: `string` (source path) + logger fn<br>Output: `Promise<void>` | ✅ Checks `fs.existsSync(sourceTemplatePath)` | Throws `Error` if source file not found | ✅ Creates `.agents/templates/`, writes `spec-template.md` |
| 5 | `this.#fs.ensureDir(agentsDir)` | Path: `'.agents'` | ✅ Internal in FS: conditional mkdir | Delegated | ✅ Dir creation |
| 6 | `this.#fs.ensureDir(skillsDir)` | Path: `'.agents/skills'` | ✅ Internal in FS: conditional mkdir | Delegated | ✅ Dir creation |
| 7 | `this.#fs.ensureDir(workflowsDir)` | Path: `'.github/workflows'` | ✅ Internal in FS: conditional mkdir | Delegated | ✅ Dir creation |
| 8 | `this.#fs.ensureDir(templatesDir)` | Path: `'.agents/templates'` | ✅ Internal in FS: conditional mkdir | Delegated | ✅ Dir creation |
| 9 | `logger(…)` | stdout message | ❌ No | N/A | ❌ None |

---

## Exported Symbols

| Export | Type | Purpose |
| :--- | :--- | :--- |
| `InitService` | `class` | Orchestrates system prompt and skill creation via injected `FileSystemService` |

---

## Depends On

| Dependency | File | Mechanism |
| :--- | :--- | :--- |
| `FileSystemService` | `src/services/FileSystemService.js` | Constructor injection (`#fs` private field) |

---

## Audit History

<details>
<summary>Click to expand</summary>

| Date | Agent | Version | Change Summary |
| :--- | :--- | :---: | :--- |
| 2026-05-28 | Cline (md-audit) | v1.0.0 | **Spec created by md-audit.** Reverse-engineered from `src/services/InitService.js` (52 lines). Code classified as **Clean / Service with DI**. All orchestration steps documented with primitive factor analysis. No modifications to production code. |
| 2026-05-28 | Cline (md-edit) | v1.1.0 | **New method `createGitHubWorkflow`.** Added to support `md init` creating `.github/workflows/mddd-preview.yml`. Updated behavioral flow diagram with new states. Updated Decision Matrix with steps 3, 7, 8. SPEC_VERSION bumped from v1.0.0 to v1.1.0 (minor — new method). Status promoted from **draft** to **stable** — implementation and tests verified. |
| 2026-06-04 | Cline (md-edit) | v1.2.0 | **New method `createSpecTemplate`.** Added to support `md init` copying `.agents/templates/spec-template.md` from the CLI package to the project. Reads the template file content via `fs.readFileSync`, ensures `.agents/templates/` dir exists, then writes `spec-template.md` via `#fs.writeFile`. Updated behavioral flow diagram with new states (`createSpecTemplate → ensureTemplatesDir → writeTemplateFile → logTemplate`). Updated Decision Matrix with steps 4, 8. SPEC_VERSION bumped from v1.1.0 to v1.2.0 (minor — new method). |

</details>