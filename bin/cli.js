#!/usr/bin/env node

import { Command } from 'commander';
import pc from 'picocolors';
import { FileSystemService } from '../src/services/FileSystemService.js';
import { ParentLinker } from '../src/services/ParentLinker.js';
import { InitService } from '../src/services/InitService.js';
import { SpecGenerator } from '../src/services/SpecGenerator.js';
import { SpecValidator } from '../src/services/SpecValidator.js';
import { SpecEditor } from '../src/services/SpecEditor.js';
import { AuditService } from '../src/services/AuditService.js';
import { ImplValidator } from '../src/services/ImplValidator.js';
import * as initCmd from '../src/commands/init.js';
import * as newCmd from '../src/commands/new.js';
import * as editCmd from '../src/commands/edit.js';
import * as auditCmd from '../src/commands/audit.js';
import * as implCmd from '../src/commands/impl.js';

// ─── Services ────────────────────────────────────────────────────────────────
const fs = new FileSystemService();
const parentLinker = new ParentLinker(fs);
const initService = new InitService(fs);
const specGenerator = new SpecGenerator(fs);
const specValidator = new SpecValidator(fs);
const specEditor = new SpecEditor(fs);
const auditService = new AuditService(fs);
const implValidator = new ImplValidator(fs);

// ─── CLI Setup ───────────────────────────────────────────────────────────────
const program = new Command();

program
  .name('md')
  .description('Manager for co-located specifications for Mermaid Diagram Driven Development (MDDD)')
  .version('2.1.0');

// ==========================================
// COMMAND: md init
// ==========================================
program
  .command('init')
  .description('Initializes the universal system prompt and matrix-driven skills to guide the AI under the MDDD methodology')
  .action(async () => {
    try {
      await initCmd.execute(initService);
    } catch (err) {
      console.error(pc.red(`❌ ${err.message}`));
      process.exit(1);
    }
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
  .action(async (targetPath, options) => {
    try {
      await newCmd.execute(specGenerator, parentLinker, fs, targetPath, options);
    } catch (err) {
      console.error(pc.red(`❌ ${err.message}`));
      process.exit(1);
    }
  });

// ==========================================
// COMMAND: md edit <specFilePath> <instruction...>
// ==========================================
program
  .command('edit')
  .description('Signals a pending change in an existing Mermaid specification file')
  .argument('<specFilePath>', 'Path to the specification file (.spec.md)')
  .argument('<instruction...>', 'The change instruction or flow adjustment')
  .action((specFilePath, instruction) => {
    try {
      editCmd.execute(specEditor, specFilePath, instruction);
    } catch (err) {
      console.error(pc.red(`❌ ${err.message}`));
      process.exit(1);
    }
  });

// ==========================================
// COMMAND: md audit <codeFilePath>
// ==========================================
program
  .command('audit')
  .description('Audits an existing code file to create a retroactive specification or suggest refactoring')
  .argument('<codeFilePath>', 'Path to the existing code file (e.g., src/services/user.go)')
  .action(async (codeFilePath) => {
    try {
      await auditCmd.execute(auditService, specGenerator, codeFilePath);
    } catch (err) {
      console.error(pc.red(`❌ ${err.message}`));
      process.exit(1);
    }
  });

// ==========================================
// COMMAND: md impl <specFilePath>
// ==========================================
program
  .command('impl')
  .description('Prepares the ecosystem to implement productive code and tests based on the specification file')
  .argument('<specFilePath>', 'Path to the specification file (.spec.md)')
  .action((specFilePath) => {
    try {
      implCmd.execute(implValidator, specFilePath);
    } catch (err) {
      console.error(pc.red(`❌ ${err.message}`));
      process.exit(1);
    }
  });

// ─── Parse ───────────────────────────────────────────────────────────────────
program.parse(process.argv);