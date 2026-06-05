/**
 * Executes the `md list-specs` command.
 * @param {{ findSpecs: (rootDir: string) => string[] }} specFinder
 * @returns {Promise<string[]>}
 */
export async function execute(specFinder) {
  const specs = specFinder.findSpecs(process.cwd());
  console.log(JSON.stringify({ specs }, null, 2));
  return specs;
}
