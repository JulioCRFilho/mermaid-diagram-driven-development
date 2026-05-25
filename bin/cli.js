#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import pc from 'picocolors';

const program = new Command();

// Searches for the closest macro (*.spec.md) by recursively traversing the directory tree
function findClosestMacro(currentDir) {
    let dir = currentDir;
    while (dir !== path.parse(dir).root) {
        try {
            const files = fs.readdirSync(dir);
            // Looks for any .spec.md file that is higher in the tree
            const macroFile = files.find(f => f.endsWith('.spec.md') && f !== `${path.basename(currentDir)}.spec.md`);

            if (macroFile) {
                return path.join(dir, macroFile);
            }
        } catch (e) {
            // Silences read permission errors in system folders
            break;
        }
        dir = path.dirname(dir);
    }
    return null;
}

program
    .name('md')
    .description('Manager for co-located specifications for Mermaid Diagram Driven Development (MDDD)')
    .version('3.0.0');

// ==========================================
// COMMAND: md init
// ==========================================
program
    .command('init')
    .description('Initializes the universal system prompt to guide any AI in the project under the MDDD methodology')
    .action(() => {
        const agentsDir = '.agents';
        const skillsDir = path.join(agentsDir, 'skills');

        // 1. Creates folder structure
        if (!fs.existsSync(agentsDir)) fs.mkdirSync(agentsDir);
        if (!fs.existsSync(skillsDir)) fs.mkdirSync(skillsDir);

        const promptContent = `# Mermaid Diagram Driven Development (MDDD) Protocol

You must strictly follow the modular feature specification architecture before changing, writing, or auditing productive code.

## 1. Tree Structure and Co-location
Visual specifications live universally in Markdown format (.md) exactly at the same level as the code they describe:
- Macro modules/domains have a \`[name].spec.md\` file containing the global diagram.
- Micro screens or sub-rule flows have a \`[name].spec.md\` file containing the interface flow + Decision Tables.

## 2. Connection Rule Between Existing Flows
Whenever you create or change a functionality using an explicit parent file:
1. Open the indicated parent file BEFORE drawing the new flow.
2. Locate the exact node from which the business bifurcation should be born.
3. Modify the Mermaid code of the PARENT file to make the arrow point to the newly generated state.
4. In the CHILD file, start the graph using an entry node that inherits the parent's context.

## 3. Strict Diagram Versioning Rule
- Every file has a metadata header \`\`.
- Whenever you change a Mermaid diagram or a decision table using the \`/md-edit\` command, you MUST increment the file's semantic version in the header before saving:
  - Change the Patch (\`v1.0.0\` -> \`v1.0.1\`) for syntax fixes or minor adjustments to node text.
  - Change the Minor (\`v1.0.0\` -> \`v1.1.0\`) for new states, new transitions, or new columns in the decision matrix.
  - Change the Major (\`v1.0.0\` -> \`v2.0.0\`) for structural changes that affect the overall flow or significant refactoring of the business rules.
- Never remove the version tag. It is the guarantee that the code implementation is aligned with the correct design.

** SPECIFICATION WRITING GUIDELINE: **
Always use Mermaid to describe business flows, architecture, or state machines. Avoid as much as possible using running text or lists to describe complex logic.
Specifications (.spec.md) must be living documents focused on the Current Contract, not on past audits.

If the file is the Feature Contract: Focus only on:
    - Mermaid Diagram (Real flow).
    - Decision Matrix (Business rules).
    - Signature of interfaces/services (API contract).
    - Versioning: Keep SPEC_VERSION always at the top.

** RULES: **
1. When generating diagrams from code, always remove function name parentheses. Keep the diagram clean and avoid rendering errors.
2. Use only Mermaid diagrams for visual representation using the 'mermaid' language.
4. Use the diagram type that best fits the specification.
5. ALWAYS WORK ON THE {fileName}.spec.md files (RESPECT the path for colocalization). If they don't exist, create them. They are the single source of truth. Never make changes directly in the code without reflecting them in the diagrams.
`;

        fs.writeFileSync('system_prompt.md', promptContent);

        // 3. Skill Definitions
        const skills = {
            'md-new': "Drawing Mode. You must run the terminal command \`md new [path_to_audited_file]\` (and include \`-p [path]\` if there is a parent). Then, assemble the Mermaid and tables within the generated file and pause to await visual approval.",
            'md-edit': "Editing Mode. Open the .spec file, apply the required changes to it and increment the header.",
            'md-audit': "Drastic Legacy Audit Mode. Analyze the existing code file from the perspective of visual readability (MDDD):\n1. Run the terminal command \`md new [file_directory]\`. If the code is modular, cohesive, and clean: map the current flow in Mermaid, fill in the decision tables, and set the initial stable version as v1.0.0. If the code is chaotic, coupled, or complex: point out the architectural problems, suggest a REFACTORING proposal separating responsibilities, and assemble the Mermaid of how the flow SHOULD BE post-refactoring. Save this spec file with a draft status.",
            'md-impl': "Implementation Mode. Read the \`.spec.md\` file as your only Source of Truth and write the productive code and equivalent tests."
        };

        Object.keys(skills).forEach(skillName => {
            // 1. Create skill folder: .agents/skills/md-new/
            const skillFolder = path.join(skillsDir, skillName);
            if (!fs.existsSync(skillFolder)) {
                fs.mkdirSync(skillFolder);
            }

            // 2. Create SKILL.md file inside: .agents/skills/md-new/SKILL.md
            const skillFile = path.join(skillFolder, 'SKILL.md');

            if (fs.existsSync(skillFile)) {
                fs.unlinkSync(skillFile);
            }

            // Adding an automatic title for better organization
            const content = `# ${skillName.toUpperCase()}\n\n${skills[skillName]}`;
            fs.writeFileSync(skillFile, content);
            console.log(pc.green(`✅ Encapsulated skill: ${skillFile}`));

        });

        console.log(pc.green('✅ Universal [system_prompt.md] file generated at the project root! You should rename it according to your AI agent naming convention.'));
        console.log(pc.green('Run the md init command everytime the npm package is updated.'));
    });

// ==========================================
// COMMAND: md new <targetPath>
// ==========================================
program
    .command('new')
    .description('Creates a new co-located specification in Markdown, injects versioning, and links to the parent flow')
    .argument('<targetPath>', 'Path to the feature directory (e.g., src/home/guest)')
    .option('-m, --macro', 'Defines if the new file will be a module macro containing stateDiagram-v2')
    .option('-p, --parent <parentFile>', 'Path to an existing spec (.spec.md) file to connect this new flow')
    .action((targetPath, options) => {
        // Ensures the base directory exists
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        // Correction: Extracts feature name for the file
        // If targetPath ends in /routing, folderName will be 'routing'.
        // The file will be 'routing.spec.md'.
        const folderName = path.basename(targetPath);
        const finalFile = path.join(targetPath, `${folderName}.spec.md`);

        // Security: Verifies if the final path exists and is a directory
        if (fs.existsSync(finalFile) && fs.lstatSync(finalFile).isDirectory()) {
            console.log(pc.red(`❌ Error: A directory with the name ${finalFile} already exists. Cannot create spec file.`));
            process.exit(1);
        }

        if (fs.existsSync(finalFile)) {
            console.log(pc.yellow(`⚠️  The specification already exists at: ${finalFile}`));
            return;
        }

        const isMacro = options.macro;
        const version = 'v1.0.0';
        let template = isMacro
            ? `\n# Macro Module: ${folderName} | ${version}\n\n` +
            `\`\`\`mermaid\n%% @spec-version ${version}\nstateDiagram-v2\n    [*] --> Initial_${folderName}\n\`\`\`\n\n` +
            `## 3. Audit History\n<details>\n<summary>Click to expand</summary>\n\n\n\n</details>\n`
            : `\n# Specification: ${folderName} | ${version}\n\n` +
            `## 1. Flow Contract (Mermaid)\n\`\`\`mermaid\n%% @spec-version ${version}\ngraph LR\n    A([Start]) --> B[Process]\n\`\`\`\n\n` +
            `## 2. Decision Matrix\n| Condition | Action | Next State |\n| :--- | :--- | :--- |\n| | | |\n\n` +
            `## 3. Audit History\n<details>\n<summary>Click to expand</summary>\n\n\n\n</details>\n`;

        fs.writeFileSync(finalFile, template);
        console.log(pc.green(`✅ New Markdown file created: ${finalFile}`));

        // Linking Logic
        let macroPath = options.parent || (!isMacro ? findClosestMacro(targetPath) : null);

        if (macroPath) {
            if (!fs.existsSync(macroPath)) {
                console.log(pc.red(`❌ Parent file not found: ${macroPath}`));
                process.exit(1);
            }
            const relativePath = path.relative(path.dirname(macroPath), finalFile);
            const cleanLinkPath = relativePath.replace(/\\/g, '/');
            const injection = `\n\n%% Automatic connection for sub-flow\n- [Go to ${folderName} rules](file://./${cleanLinkPath})\n`;

            fs.appendFileSync(macroPath, injection);
            console.log(pc.blue(`🔗 Successfully linked in parent file: ${macroPath}`));
        }
    });

// ==========================================
// COMMAND: md edit <specFilePath> <instruction>
// ==========================================
program
    .command('edit')
    .description('Signals a pending change in an existing Mermaid specification file')
    .argument('<specFilePath>', 'Path to the spec file (.spec.md)')
    .argument('<instruction...>', 'The change instruction or flow adjustment')
    .action((specFilePath, instruction) => {
        if (!fs.existsSync(specFilePath)) {
            console.log(pc.red(`❌ Specification file not found: ${specFilePath}`));
            process.exit(1);
        }

        const fullInstruction = instruction.join(' ');
        console.log(pc.cyan(`📝 Requesting change to flow: "${specFilePath}"`));
        console.log(pc.yellow(`⚙️  Evaluated instruction: ${fullInstruction}`));
        console.log(pc.green(`\n🚀 Ready! Use the /md-edit shortcut in the chat for the AI to apply the changes and increment the version.`));
    });

// ==========================================
// COMMAND: md audit <codeFilePath>
// ==========================================
program
    .command('audit')
    .description('Audits an existing code file to create a retroactive specification or suggest refactoring')
    .argument('<codeFilePath>', 'Path to existing code file (e.g., src/services/user.go)')
    .action((codeFilePath) => {
        if (!fs.existsSync(codeFilePath)) {
            console.log(pc.red(`❌ Code file not found: ${codeFilePath}`));
            process.exit(1);
        }

        const targetDir = path.dirname(codeFilePath);
        const fileName = path.basename(codeFilePath);

        console.log(pc.cyan(`🔍 Auditing code structure for coupling in: ${fileName}...`));
        console.log(pc.yellow(`⚡ Requesting AI to validate complexity before generating MDDD specification.`));

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        console.log(pc.green(`\n🚀 Ready! Use the /md-audit shortcut in the chat to receive the analysis or refactoring diagram.`));
    });

// ==========================================
// COMMAND: md impl <specFilePath>
// ==========================================
program
    .command('impl')
    .description('Prepares the ecosystem to implement productive code and tests based on the spec file')
    .argument('<specFilePath>', 'Path to the specification file (.spec.md)')
    .action((specFilePath) => {
        if (!fs.existsSync(specFilePath)) {
            console.log(pc.red(`❌ Specification file not found: ${specFilePath}`));
            process.exit(1);
        }

        const fileName = path.basename(specFilePath);
        console.log(pc.cyan(`🛠️  Reading business blueprint from: ${fileName}...`));
        console.log(pc.yellow(`🎯 Establishing the signed diagram as the Single Source of Truth.`));
        console.log(pc.green(`\n🚀 Ready! Use the /md-impl shortcut in the chat for the AI to start generating productive code and tests.`));
    });

program.parse(process.argv);