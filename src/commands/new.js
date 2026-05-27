import path from 'node:path';
import pc from 'picocolors';

/**
 * Executes the `md new <targetPath>` command.
 * @param {import('../services/SpecGenerator.js').SpecGenerator} specGenerator
 * @param {import('../services/ParentLinker.js').ParentLinker} parentLinker
 * @param {import('../services/FileSystemService.js').FileSystemService} fs
 * @param {string} targetPath
 * @param {{ macro?: boolean, parent?: string }} options
 * @returns {Promise<void>}
 */
export async function execute(specGenerator, parentLinker, fs, targetPath, options) {
  const normalizedPath = path.normalize(targetPath).replace(/[\\/]+$/, '');

  fs.ensureDir(normalizedPath);

  const folderName = path.basename(normalizedPath);
  const finalFile = path.join(normalizedPath, `${folderName}.spec.md`);

  if (fs.existsSync(finalFile) && fs.existsSync(finalFile)) {
    // Check if it's a directory (edge case)
    try {
      const stats = await fs.getRaw().stat?.(finalFile);
      if (stats?.isDirectory()) {
        console.log(pc.red(`❌ Error: A directory named ${finalFile} already exists. Cannot create specification file.`));
        process.exit(1);
      }
    } catch {
      // stat not available in mock, fall through to normal check
    }
  }

  if (fs.existsSync(finalFile)) {
    console.log(pc.yellow(`⚠️  Specification already exists at: ${finalFile}. Operation aborted to avoid link duplication in the parent file.`));
    process.exit(0);
  }

  const isMacro = options.macro || false;
  const version = 'v1.0.0';

  const { filePath } = await specGenerator.create(normalizedPath, isMacro, version);
  console.log(pc.green(`✅ New specification file created: ${filePath}`));

  let macroPath = options.parent || (!isMacro ? parentLinker.findClosestMacro(normalizedPath) : null);

  if (macroPath) {
    if (!fs.existsSync(macroPath)) {
      console.log(pc.red(`❌ Specified parent file not found: ${macroPath}`));
      process.exit(1);
    }

    await parentLinker.linkToParent(macroPath, filePath, folderName);
    console.log(pc.blue(`🔗 Successfully linked into parent flow: ${macroPath}`));
  }
}