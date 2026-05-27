/**
 * Template engine for generating .spec.md file blueprints.
 */
export class TemplateFactory {
  /**
   * Generates a macro module template (stateDiagram-v2).
   * @param {string} folderName
   * @param {string} version
   * @returns {string}
   */
  static macroTemplate(folderName, version) {
    return (
      `\n# Macro Module: ${folderName} | ${version}\n\n` +
      '```mermaid\n' +
      `%% @spec-version ${version}\n` +
      'stateDiagram-v2\n' +
      `    [*] --> Initial_${folderName}\n` +
      '```\n\n' +
      '## 3. Audit History\n' +
      '<details>\n' +
      '<summary>Click to expand</summary>\n' +
      '\n\n\n' +
      '</details>\n'
    );
  }

  /**
   * Generates a micro feature template (graph LR + Decision Matrix).
   * @param {string} folderName
   * @param {string} version
   * @returns {string}
   */
  static microTemplate(folderName, version) {
    return (
      `\n# Specification: ${folderName} | ${version}\n\n` +
      '## 1. Flow Contract (Mermaid)\n' +
      '```mermaid\n' +
      `%% @spec-version ${version}\n` +
      'graph LR\n' +
      '    A([Start]) --> B[Process]\n' +
      '```\n\n' +
      '## 2. Decision Matrix\n' +
      '| Factor A? | Factor B? | Proposed Action | Decision (Outcome) | Transition State (New Status) |\n' +
      '| :---: | :---: | :--- | :---: | :---: |\n' +
      '| | | | | |\n\n' +
      '## 3. Audit History\n' +
      '<details>\n' +
      '<summary>Click to expand</summary>\n' +
      '\n\n\n' +
      '</details>\n'
    );
  }

  /**
   * Generates an audit template (graph LR + AuditHistory).
   * @param {string} codeBaseName
   * @param {string} version
   * @returns {string}
   */
  static auditTemplate(codeBaseName, version) {
    return (
      `# Audit: ${codeBaseName} | ${version}\n\n` +
      '## 1. Flow Contract (Mermaid)\n' +
      '```mermaid\n' +
      `%% @spec-version ${version}\n` +
      'graph LR\n' +
      '    A([Start]) --> B[Process]\n' +
      '```\n\n' +
      '## 2. Decision Matrix\n' +
      '| Condition | Action | Next State |\n' +
      '| :---: | :--- | :---: |\n' +
      '| | | |\n\n' +
      '## 3. Audit History\n' +
      '<details>\n' +
      '<summary>Click to expand</summary>\n' +
      '\n\n\n' +
      '</details>\n'
    );
  }
}