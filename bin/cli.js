#!/usr/bin/env node

import { Command } from 'commander';
import pc from 'picocolors';
import { FileSystemService } from '../src/services/FileSystemService.js';
import { InitService } from '../src/services/InitService.js';
import { validateMermaidSyntax } from '../src/commands/validator.js';
import * as initCmd from '../src/commands/init.js';

// ─── Services ────────────────────────────────────────────────────────────────
const fs = new FileSystemService();
const initService = new InitService(fs);

// ─── CLI Setup ───────────────────────────────────────────────────────────────
const program = new Command();

program
  .name('md')
  .description('Manager for co-located specifications for Mermaid Diagram Driven Development (MDDD)')
  .version('6.2.0');

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

  program
  .command('validate <target>')
  .description('Validate Mermaid diagrams in .md files (returns JSON)')
  .action(async (target) => {
    // Executa a lógica de validação na memória
    const result = await validateMermaidSyntax(target);

    // Cospe APENAS o JSON no stdout para a IA ler de forma limpa
    console.log(JSON.stringify(result));

    // Controla o encerramento do processo com o exit code correto
    if (!result.valid) {
      process.exit(1);
    }
    process.exit(0);
  });

// ─── Parse ─────────────────────────────────────────────────────────────────
program.parse(process.argv);
