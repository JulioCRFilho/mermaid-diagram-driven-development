#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import pc from 'picocolors';

const program = new Command();

// Searches for the closest macro (*.spec.md) by recursively traversing the directory tree
function findClosestMacro(currentDir) {
    let dir = path.resolve(currentDir);
    const root = path.parse(dir).root;

    while (dir !== root) {
        try {
            const files = fs.readdirSync(dir);
            const macroFile = files.find(f => f.endsWith('.spec.md') && f !== `${path.basename(currentDir)}.spec.md`);

            if (macroFile) {
                return path.join(dir, macroFile);
            }
        } catch (e) {
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

program
    .name('md')
    .description('Manager for co-located specifications for Mermaid Diagram Driven Development (MDDD)')
    .version('2.0.0');

// ==========================================
// COMMAND: md init
// ==========================================
program
    .command('init')
    .description('Initializes the universal system prompt and matrix-driven skills to guide the AI under the MDDD methodology')
    .action(() => {
        const agentsDir = '.agents';
        const skillsDir = path.join(agentsDir, 'skills');

        if (!fs.existsSync(agentsDir)) fs.mkdirSync(agentsDir);
        if (!fs.existsSync(skillsDir)) fs.mkdirSync(skillsDir);

        // SYSTEM PROMPT: Uso de 4 crases externas para isolar com precisão o bloco Mermaid interno
        const promptContent = `# Mermaid Diagram Driven Development (MDDD) Protocol

You are an engineering agent operating strictly under MDDD. Your cognitive processing is guided by visual topologies and truth tables, completely eliminating text-based specification ambiguity.

\`\`\`mermaid
%% @spec-version v1.0.0
stateDiagram-v2
    [*] --> ReadSpecification: User Trigger Fired
    ReadSpecification --> CheckDecisionMatrix: Evaluate Primitive Factors
    CheckDecisionMatrix --> HaltWithConflict: Constraint Violation / Feature Creep
    CheckDecisionMatrix --> ExecuteAction: Strict Match Confirmed
    ExecuteAction --> MutateState: Apply File/Code Changes
    MutateState --> UpdateVersionHeader: Apply Semantic Version Rules
    UpdateVersionHeader --> [*]
\`\`\`

## 1. Co-location Architecture Tree

src/
└── [domain]/
├── [name].spec.md       # 🌎 Macro Module Domain (stateDiagram-v2 Global Map)
└── [feature]/
├── [name].spec.md   # 🔬 Micro Flow Contract (graph LR) + Decision Matrix
└── [code].dart       # 💻 Target Production Code File

## 2. Parent Interaction Logic

\`\`\`mermaid
graph TD
    A[Create/Change Sub-Feature] --> B[Open Indicated Parent File]
    B --> C[Locate Bifurcation Node in Parent Mermaid]
    C --> D[Modify Parent Graph: Point Arrow to New State]
    D --> E[Child File: Inherit Parent Context in Entry Node]
\`\`\`

## 3. Core Behavioral Framework Matrix

| User Context | Target Spec Header | Human Request Path | Diagram Change Impact | AI Core Rule / Mandate / Ironclad Clause |
| :---: | :---: | :---: | :---: | :--- |
| - | **MISSING** | - | - | Never remove, omit, or bypass the version tag from files. |
| Code Change Needed | **SIGNED** | Contradicts Matrix | - | 🛑 **HALT**: Refuse code generation. Demand \`md edit\` to align design first. |
| Feature Writing | - | Continuous Text Block | - | 📊 **STRUCTURE**: Convert text into tables of primitive factors (yes/no/rigid values). |
| Command Executed | \`SPEC_VERSION\` | - | Typo / Label Only | Increment Patch (\`v1.0.0\` -> \`v1.0.1\`) |
| Command Executed | \`SPEC_VERSION\` | - | New State / Arrow / Matrix Column | Increment Minor (\`v1.0.0\` -> \`v1.1.0\`) |
| Command Executed | \`SPEC_VERSION\` | - | Structural Breaking / Flow Overhaul | Increment Major (\`v1.0.0\` -> \`v2.0.0\`) |

## 4. Anti-Hallucination Guardrails
1. **No Spec, No Code:** You are strictly forbidden from writing a single line of production code or unit tests if the corresponding `.spec.md` file does not exist or does not contain a populated Decision Matrix.
2. **Implicit Logic Ban:** If a business condition, validation check, or outcome branch is not explicitly listed as a row or column in the Decision Matrix, it does not exist. Do not assume or extrapolate rules.
3. **Strict State Isolation:** When handling a micro feature, you cannot introduce global states or modify sibling domains unless instructed via explicit macro architectural mapping updates.
`;

        fs.writeFileSync('system_prompt.md', promptContent);

        // SKILLS AUTOMATION: Resolvido o aninhamento de strings escapando as crases internas com barras triplas
        const skills = {
            'md-new': `[ROLE: ARCHITECT] [STRICT CONTRACT]

\`\`\`mermaid
%% @spec-version v1.1.0
stateDiagram-v2
    [*] --> TargetVerification
    TargetVerification --> StopAndSwitchToEdit: .spec.md File Already Exists
    TargetVerification --> EvaluateContext: File Does Not Exist
    
    state EvaluateContext {
        [*] --> CheckDirectoryDepth
        CheckDirectoryDepth --> InferMacro: Target is Domain Root (e.g., src/domain)
        CheckDirectoryDepth --> InferMicro: Target is Sub-Feature (e.g., src/domain/feature)
    }

    InferMacro --> ExecCliNew: Apply stateDiagram-v2 Template
    InferMicro --> ExecCliNew: Apply graph LR + Matrix Template
    
    ExecCliNew --> AwaitHumanReview: Run "md new [path]" & Populate Blueprint
    AwaitHumanReview --> [*]: Pause Code & Test Generation
\`\`\`

### Operational Execution Matrix

| File Exists? | Path Depth Type | Parent Indicated? | CLI Execution Syntax | Target Payload Blueprint | Next AI Action |
| :---: | :---: | :---: | :--- | :--- | :---: |
| ✅ YES | - | - | *None* (Aborted) | *None* | 🛑 **STOP** (Call md-edit instead) |
| ❌ NO | Domain Root | ❌ NO | \`md new [domain_path]\` | \`stateDiagram- v2\` Placeholder Domain Map | ⏳ **AWAIT_VISUAL_APPROVAL** |
| ❌ NO | Sub-Feature | ❌ NO | \`md new [feature_path]\` | \`graph LR\` + Auto-scanned parent link reference | ⏳ **AWAIT_VISUAL_APPROVAL** |
| ❌ NO | Sub-Feature | ✅ YES | \`md new [feature_path] - p[parent]\` | \`graph LR\` + Explicit link injected to designated Parent | ⏳ **AWAIT_VISUAL_APPROVAL** |

### Automation & Inference Ironclad Rules
1. **Deterministic Inference:** You must strictly follow the directory depth. If the target path is a top-level domain folder inside your source root, treat it as a Module Macro. If it is nested inside a domain, it is a Micro Feature. Never ask the user to declare this.
2. **Implicit Parent Binding:** When creating a Sub-Feature without an explicit \`- p\` parameter, acknowledge that the CLI tool will automatically scan and mutate the nearest parent macro file via recursive climbing. You must read the updated parent immediately after execution to synchronize your internal context map.`,

            'md-edit': `[ROLE: ARCHITECT] [STRICT CONTRACT]

\`\`\`mermaid
%% @spec-version v1.1.0
stateDiagram-v2
    [*] --> TargetVerification
    TargetVerification --> StopAndSwitchToEdit: .spec.md File Already Exists
    TargetVerification --> EvaluateContext: File Does Not Exist
    
    state EvaluateContext {
        [*] --> CheckDirectoryDepth
        CheckDirectoryDepth --> InferMacro: Target is Domain Root (e.g., src/domain)
        CheckDirectoryDepth --> InferMicro: Target is Sub-Feature (e.g., src/domain/feature)
    }

    InferMacro --> ExecCliNew: Apply stateDiagram-v2 Template
    InferMicro --> ExecCliNew: Apply graph LR + Matrix Template
    
    ExecCliNew --> AwaitHumanReview: Run "md new [path]" & Populate Blueprint
    AwaitHumanReview --> [*]: Pause Code & Test Generation
\`\`\`

### Operational Execution Matrix

| File Exists? | Path Depth Type | Parent Indicated? | CLI Execution Syntax | Target Payload Blueprint | Next AI Action |
| :---: | :---: | :---: | :--- | :--- | :---: |
| ✅ YES | - | - | *None* (Aborted) | *None* | 🛑 **STOP** (Call md-edit instead) |
| ❌ NO | Domain Root | ❌ NO | \`md new [domain_path]\` | \`stateDiagram-v2\` Placeholder Domain Map | ⏳ **AWAIT_VISUAL_APPROVAL** |
| ❌ NO | Sub-Feature | ❌ NO | \`md new [feature_path]\` | \`graph LR\` + Auto-scanned parent link reference | ⏳ **AWAIT_VISUAL_APPROVAL** |
| ❌ NO | Sub-Feature | ✅ YES | \`md new [feature_path] -p [parent]\` | \`graph LR\` + Explicit link injected to designated Parent | ⏳ **AWAIT_VISUAL_APPROVAL** |

### Automation & Inference Ironclad Rules
1. **Deterministic Inference:** You must strictly follow the directory depth. If the target path is a top-level domain folder inside your source root, treat it as a Module Macro. If it is nested inside a domain, it is a Micro Feature. Never ask the user to declare this.
2. **Implicit Parent Binding:** When creating a Sub-Feature without an explicit \`-p\` parameter, acknowledge that the CLI tool will automatically scan and mutate the nearest parent macro file via recursive climbing. You must read the updated parent immediately after execution to synchronize your internal context map.`,

            'md-audit': `[ROLE: SECURITY & QUALITY AUDITOR] [STRICT CONTRACT]

\`\`\`mermaid
%% @spec-version v1.1.0
stateDiagram-v2
    [*] --> AnalyzeLegacyCode: Evaluate Coupling & Scope Leaks
    AnalyzeLegacyCode --> FileSystemCheck
    
    state FileSystemCheck {
        [*] --> CheckCoLocation
        CheckCoLocation --> CreateMissingSpec: Target Co-located .spec.md Missing
        CheckCoLocation --> AppendToExisting: Target Co-located .spec.md Exists
    }
    
    CreateMissingSpec --> RenderTopology: Initialize New .spec.md
    AppendToExisting --> InjectAuditBlock: Target Existing File Preservation Map
    
    state RenderTopology {
        [*] --> CodeIsClean: Map exact architecture as-is (v1.0.0)
        [*] --> CodeIsChaotic: Draw BOTH current real logic AND ideal target refactored graph
    }
    
    RenderTopology --> WriteToAuditTag: Inject payloads inside <details> block
    InjectAuditBlock --> WriteToAuditTag: Append to existing <details> block without overwriting business specs
    WriteToAuditTag --> EnforceImmutability: Lock Production Code File
    EnforceImmutability --> [*]
\`\`\`

### Reverse Engineering & Auto-Repair Decision Matrix

| Source File State | Co-located .spec.md Exists? | Code Design Assessment | Target Output Destination | Code File Manipulation Allowed? | Initial Compiled Version |
| :--- | :---: | :---: | :--- | :---: | :---: |
| Legacy Code Active | ✅ YES | Clean / Modular | Append to existing \`<details><summary>Audit History</summary>\` | ❌ **FORBIDDEN (Immutability)** | Retain Current |
| Legacy Code Active | ✅ YES | Chaotic / Coupled | Append to existing \`<details><summary>Audit History</summary>\` | ❌ **FORBIDDEN (Immutability)** | Retain Current |
| Legacy Code Active | ❌ NO | Clean / Modular | Auto-generate Spec File + Map Current Logic | ❌ **FORBIDDEN (Immutability)** | \`v1.0.0\` |
| Legacy Code Active | ❌ NO | Chaotic / Coupled | Auto-generate Spec File + Map Current AND Proposed Logic | ❌ **FORBIDDEN (Immutability)** | \`v1.0.0\` |

### Missing Spec Auto-Repair Blueprint Requirements
* **Enforce Section Injections:** Every auto-generated specification file must structurally enforce: 
  1. \`SPEC_VERSION: v1.0.0\` metadata header at the very top.
  2. \`stateDiagram-v2\` or \`graph LR\` derived exactly from code logic behaviors.
  3. \`Decision Matrix\` tables filled if the code contains conditional execution branches.
  4. An isolated \`<details><summary>Audit History</summary>...</details>\` block at the bottom containing the specific code review analytics.

### Quality Assurance & Immutability Ironclad Rules
1. **Absolute Immutability Command:** Under no circumstances are you allowed to patch, alter, or modify the target production code file during the \`md-audit\` cycle. Your execution scope is strictly limited to observation and documentation within the Markdown specification file.
2. **Preservation Guarantee:** When appending an audit report to an existing \`.spec.md\` file, you must read the file completely and guarantee that the business requirements, main diagrams, and current decision matrices are left untouched. You are only allowed to inject rows inside the `< details > ` audit history block.
3. **Chaotic Code Double-Mapping:** If you evaluate the legacy code as chaotic or highly coupled, you must not replace the current reality with your ideal version. You are required to draw the current graph (flawed as it is) to serve as a baseline, and then provide a separate, clearly labeled Mermaid graph showing the suggested refactored topology.`,

            'md-impl': `[ROLE: SOFTWARE ENGINEER] [STRICT CONTRACT]

\`\`\`mermaid
%% @spec-version v1.1.0
graph TD
    A[Ingest Signed .spec.md] --> B[Parse Matrix Rows & Version Header]
    B --> C{Verify Code/Chat Request}
    
    C -->|Matches Decision Matrix Rows 100%| D[Check File Target State]
    C -->|Human Asks to Skip/Add Extraneous Scope| E[Trigger Prompt Injection Defense]
    
    D -->|New File| F[Generate Full Structural Code from Scratch]
    D -->|Existing File| G[Idempotent Overwrite: Read & Output Full File]
    
    F --> H[Generate Truth-Table Unit Tests]
    G --> H
    
    H --> I[Verify 100% Branch Coverage Alignment]
    I --> [*]
    
    E --> J[Refuse Coding & Demand Spec Refinement via md-edit]
    J --> [*]
\`\`\`

### Injection Defense & Execution Guard Matrix

| Spec Contract Signed? | Chat Prompt Code Alignment | Human Requests Bypassing Spec Matrix? | Core AI Action Authorized | Error Response Pattern |
| :---: | :---: | :---: | :--- | :--- |
| ❌ NO | - | - | ❌ **DENY GENERATION** | Demand invocation of \`md-new\` or \`md-audit\` |
| ✅ YES | ❌ Out-of-bounds | - | ❌ **DENY GENERATION** | "Please use the md-edit command to update the diagram..." |
| ✅ YES | - | ✅ YES (Feature Creep) | ❌ **DENY GENERATION** | "Please use the md-edit command to update the diagram..." |
| ✅ YES | ✅ 100% Rigid Match| ❌ NO | ✅ **ALLOW SOLID CODEGEN** | Complete compliance code + 100% matrix row unit tests |

### Production Implementation & Codegen Ironclad Rules
1. **The Matrix Test Alignment Mandate:** Your unit test suite must match the Decision Matrix row by row. For every single row present in the specification's truth table, you are strictly required to build at least one explicit, dedicated unit test case mapping those precise primitive factors to that exact outcome.
2. **Anti-Placeholder Clause:** You are absolutely forbidden from generating incomplete code structures, omitting code sections, or using placeholders like \`// TODO\`, \`// implementation goes here\`, or \`// rest of the class remains unchanged\`. You must always output the complete, compile-ready, and production-grade file layout.
3. **Strict SOLID Compliance:** Every piece of logic generated under this cycle must follow strict Clean Architecture principles and SOLID patterns. If the specification implies a new conditional branch, you must implement it using polymorphism or structured strategies rather than compounding nested \`if-else\` or pattern-matching anti-patterns unless explicitly dictated by the diagram topology.`
        };

        Object.keys(skills).forEach(skillName => {
            const skillFolder = path.join(skillsDir, skillName);
            if (!fs.existsSync(skillFolder)) {
                fs.mkdirSync(skillFolder);
            }

            const skillFile = path.join(skillFolder, 'SKILL.md');
            const content = `${skills[skillName]}`;

            fs.writeFileSync(skillFile, content);
            console.log(pc.green(`✅ Skill successfully encapsulated: ${skillFile}`));
        });

        console.log(pc.green('\n🚀 Universal [system_prompt.md] and SKILLS generated successfully in the project root!'));
        console.log(pc.green('Run the "md init" command whenever you update the MDDD-CLI NPM package.'));
    });

// ==========================================
// COMMAND: md new <targetPath>
// ==========================================
program
    .command('new')
    .description('Creates a new co-located specification in Markdown, injects the version header, and links to the parent flow')
    .argument('<targetPath>', 'Path to the feature directory (e.g., src/home/guest)')
    .option('-m, --macro', 'Defines if the new file will be a module macro containing a stateDiagram-v2')
    .option('-p, --parent <parentFile>', 'Path to an existing specification file (.spec.md) to connect this new flow')
    .action((targetPath, options) => {
        const normalizedPath = path.normalize(targetPath).replace(/[\\/]+$/, '');

        if (!fs.existsSync(normalizedPath)) {
            fs.mkdirSync(normalizedPath, { recursive: true });
        }

        const folderName = path.basename(normalizedPath);
        const finalFile = path.join(normalizedPath, `${folderName}.spec.md`);

        if (fs.existsSync(finalFile) && fs.lstatSync(finalFile).isDirectory()) {
            console.log(pc.red(`❌ Error: A directory named ${finalFile} already exists. Cannot create specification file.`));
            process.exit(1);
        }

        if (fs.existsSync(finalFile)) {
            console.log(pc.yellow(`⚠️  Specification already exists at: ${finalFile}. Operation aborted to avoid link duplication in the parent file.`));
            process.exit(0);
        }

        const isMacro = options.macro;
        const version = 'v1.0.0';

        let template = isMacro
            ? `\n# Macro Module: ${folderName} | ${version}\n\n` +
            `\`\`\`mermaid\n%% @spec-version ${version}\nstateDiagram-v2\n    [*] --> Initial_${folderName}\n\`\`\`\n\n` +
            `## 3. Audit History\n<details>\n<summary>Click to expand</summary>\n\n\n\n</details>\n`
            : `\n# Specification: ${folderName} | ${version}\n\n` +
            `## 1. Flow Contract (Mermaid)\n\`\`\`mermaid\n%% @spec-version ${version}\ngraph LR\n    A([Start]) --> B[Process]\n\`\`\`\n\n` +
            `## 2. Decision Matrix\n| Factor A? | Factor B? | Proposed Action | Decision (Outcome) | Transition State (New Status) |\n| :---: | :---: | :--- | :---: | :---: |\n| | | | | |\n\n` +
            `## 3. Audit History\n<details>\n<summary>Click to expand</summary>\n\n\n\n</details>\n`;

        fs.writeFileSync(finalFile, template);
        console.log(pc.green(`✅ New specification file created: ${finalFile}`));

        let macroPath = options.parent || (!isMacro ? findClosestMacro(normalizedPath) : null);

        if (macroPath) {
            if (!fs.existsSync(macroPath)) {
                console.log(pc.red(`❌ Specified parent file not found: ${macroPath}`));
                process.exit(1);
            }

            const relativePath = path.relative(path.dirname(macroPath), finalFile);
            const cleanLinkPath = relativePath.replace(/\\/g, '/');
            const injection = `\n\n%% Automatic connection for sub-flow\n- [Go to ${folderName} rules](file://./${cleanLinkPath})\n`;

            fs.appendFileSync(macroPath, injection);
            console.log(pc.blue(`🔗 Successfully linked into parent flow: ${macroPath}`));
        }
    });

// ==========================================
// COMMANDS: md edit | md audit | md impl
// ==========================================
program
    .command('edit')
    .description('Signals a pending change in an existing Mermaid specification file')
    .argument('<specFilePath>', 'Path to the specification file (.spec.md)')
    .argument('<instruction...>', 'The change instruction or flow adjustment')
    .action((specFilePath, instruction) => {
        if (!fs.existsSync(specFilePath)) {
            console.log(pc.red(`❌ Specification file not found: ${specFilePath}`));
            process.exit(1);
        }
        const fullInstruction = instruction.join(' ');
        console.log(pc.cyan(`📝 Requesting alteration in flow: "${specFilePath}"`));
        console.log(pc.yellow(`⚙️  Evaluated instruction: ${fullInstruction}`));
        console.log(pc.green(`\n🚀 Ready! Use the /md-edit shortcut in chat for the AI to apply changes to the diagram and increment the version.`));
    });

program
    .command('audit')
    .description('Audits an existing code file to create a retroactive specification or suggest refactoring')
    .argument('<codeFilePath>', 'Path to the existing code file (e.g., src/services/user.go)')
    .action((codeFilePath) => {
        if (!fs.existsSync(codeFilePath)) {
            console.log(pc.red(`❌ Code file not found: ${codeFilePath}`));
            process.exit(1);
        }

        const targetDir = path.dirname(codeFilePath);
        const codeBaseName = path.basename(codeFilePath, path.extname(codeFilePath));
        const specFileName = `${codeBaseName}.spec.md`;
        const specFilePath = path.join(targetDir, specFileName);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        if (!fs.existsSync(specFilePath)) {
            const version = 'v1.0.0';
            const template = `# Audit: ${codeBaseName} | ${version}\n\n` +
                `## 1. Flow Contract (Mermaid)\n\`\`\`mermaid\n%% @spec-version ${version}\ngraph LR\n    A([Start]) --> B[Process]\n\`\`\`\n\n` +
                `## 2. Decision Matrix\n| Condition | Action | Next State |\n| :---: | :--- | :---: |\n| | | |\n\n` +
                `## 3. Audit History\n<details>\n<summary>Click to expand</summary>\n\n\n\n</details>\n`;
            fs.writeFileSync(specFilePath, template);
            console.log(pc.green(`✅ Co-located specification file created: ${specFilePath}`));
        } else {
            console.log(pc.blue(`📄 Existing specification found: ${specFilePath}`));
        }

        console.log(pc.cyan(`🔍 Auditing code structure for coupling in: ${path.basename(codeFilePath)}...`));
        console.log(pc.yellow(`⚡ The AI will validate complexity and write the analysis to: ${specFilePath}`));
        console.log(pc.green(`\n🚀 Ready! Use the /md-audit shortcut in chat for the AI to write the analysis and structural refactoring diagram into the co-located spec file.`));
    });

program
    .command('impl')
    .description('Prepares the ecosystem to implement productive code and tests based on the specification file')
    .argument('<specFilePath>', 'Path to the specification file (.spec.md)')
    .action((specFilePath) => {
        if (!fs.existsSync(specFilePath)) {
            console.log(pc.red(`❌ Specification file not found: ${specFilePath}`));
            process.exit(1);
        }
        const fileName = path.basename(specFilePath);
        console.log(pc.cyan(`🛠️  Reading business blueprint from: ${fileName}...`));
        console.log(pc.yellow(`🎯 Establishing the signed diagram as the Single Source of Truth.`));
        console.log(pc.green(`\n🚀 Ready! Use the /md-impl shortcut in chat for the AI to start generating productive code and tests.`));
    });

program.parse(process.argv);