#!/usr/bin/env node

import { Command } from 'commander';
import pc from 'picocolors';
import { FileSystemService } from '../src/services/FileSystemService.js';
import { InitService } from '../src/services/InitService.js';
import * as initCmd from '../src/commands/init.js';

// ─── Services ────────────────────────────────────────────────────────────────
const fs = new FileSystemService();
const initService = new InitService(fs);

// ─── CLI Setup ───────────────────────────────────────────────────────────────
const program = new Command();

program
  .name('md')
  .description('Manager for co-located specifications for Mermaid Diagram Driven Development (MDDD)')
  .version('4.0.0');

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

// ─── Parse ───────────────────────────────────────────────────────────────────
program.parse(process.argv);