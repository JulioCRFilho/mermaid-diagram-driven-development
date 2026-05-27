import pc from 'picocolors';

/**
 * Executes the `md impl <specFilePath>` command.
 * @param {import('../services/ImplValidator.js').ImplValidator} implValidator
 * @param {string} specFilePath
 * @returns {void}
 */
export function execute(implValidator, specFilePath) {
  implValidator.validate(specFilePath);

  const fileName = specFilePath.split('/').pop() || specFilePath.split('\\').pop();
  console.log(pc.cyan(`🛠️  Reading business blueprint from: ${fileName}...`));
  console.log(pc.yellow(`🎯 Establishing the signed diagram as the Single Source of Truth.`));
  console.log(pc.green(`\n🚀 Ready! Use the /md-impl shortcut in chat for the AI to start generating productive code and tests.`));
}