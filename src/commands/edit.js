import pc from 'picocolors';

/**
 * Executes the `md edit <specFilePath>` command.
 * @param {import('../services/SpecEditor.js').SpecEditor} specEditor
 * @param {string} specFilePath
 * @param {string[]} instructionParts
 * @returns {void}
 */
export function execute(specEditor, specFilePath, instructionParts) {
  specEditor.validateSpec(specFilePath);

  const fullInstruction = instructionParts.join(' ');
  const prepared = specEditor.prepareInstruction(specFilePath, fullInstruction);

  console.log(pc.cyan(`📝 Requesting alteration in flow: "${prepared.specFilePath}"`));
  console.log(pc.yellow(`⚙️  Evaluated instruction: ${prepared.instruction}`));
  console.log(pc.green(`\n🚀 Ready! Use the /md-edit shortcut in chat for the AI to apply changes to the diagram and increment the version.`));
}