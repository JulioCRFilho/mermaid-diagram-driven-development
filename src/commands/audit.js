import pc from 'picocolors';
import { SpecGenerator } from '../services/SpecGenerator.js';
import { AuditService } from '../services/AuditService.js';

/**
 * Executes the `md audit <codeFilePath>` command.
 * @param {AuditService} auditService
 * @param {SpecGenerator} specGenerator
 * @param {string} codeFilePath
 * @returns {Promise<void>}
 */
export async function execute(auditService, specGenerator, codeFilePath) {
  auditService.validateCodeFile(codeFilePath);

  const { specFilePath: finalSpecPath } = await specGenerator.createIfMissing(codeFilePath);
  const result = auditService.run(codeFilePath, finalSpecPath);

  console.log(pc.blue(`📄 Existing specification: ${finalSpecPath}`));
  console.log(pc.cyan(`🔍 Auditing code structure for coupling in: ${result.codeBasename}...`));
  console.log(pc.yellow(`⚡ The AI will validate complexity and write the analysis to: ${finalSpecPath}`));
  console.log(pc.green(`\n🚀 Ready! Use the /md-audit shortcut in chat for the AI to write the analysis and structural refactoring diagram into the co-located spec file.`));
}