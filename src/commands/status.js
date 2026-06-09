/**
 * Executes the `md status` command.
 * Generates a beautiful MDDD coverage report with metrics from all .spec.md files.
 */

import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';

/**
 * @typedef {Object} SpecMetrics
 * @property {string} relativePath
 * @property {string} version
 * @property {'draft' | 'stable'} status
 * @property {'Coeso' | 'Caótico' | undefined} classification
 * @property {number} tasksTotal
 * @property {number} tasksCompleted
 * @property {number} tasksPending
 * @property {number} totalChanges
 * @property {{ major: number, minor: number, patch: number }} changeBreakdown
 * @property {{ discovery: number, fix: number, improvement: number, documentation: number, refactor: number, other: number }} changeTypes
 */

/**
 * @typedef {Object} DashboardSummary
 * @property {number} totalSpecs
 * @property {number} coesoCount
 * @property {number} caoticoCount
 * @property {number} unclassifiedCount
 * @property {number} totalTasks
 * @property {number} completedTasks
 * @property {number} pendingTasks
 * @property {number} totalChanges
 * @property {number} totalDiscoveries
 * @property {number} totalFixes
 * @property {number} totalImprovements
 * @property {number} totalDocumentation
 * @property {number} totalRefactors
 * @property {number} totalMajors
 * @property {number} totalMinors
 * @property {number} totalPatches
 * @property {string[]} criticalPoints
 * @property {SpecMetrics[]} specs  // detailed per-spec data for testing
 */

/**
 * Classifies a change summary entry into a type category.
 * @param {string} summary
 * @returns {string}
 */
function classifyChangeType(summary) {
  const s = summary.toLowerCase();

  if (/\b(discovery|descoberta|found|encontrado)\b/.test(s)) return 'discovery';
  if (/\b(fix|bug|correç[ãa]o|corrigido|defeito)\b/.test(s)) return 'fix';
  if (/\b(improvement|melhoria|enhance|refinamento|aprimoramento)\b/.test(s)) return 'improvement';
  if (/\b(documentation|doc|docs|diagram|documentaç[ãa]o|readme)\b/.test(s)) return 'documentation';
  if (/\b(refactor|refatoraç[ãa]o|reestrutura|simplifica|reescrita)\b/.test(s)) return 'refactor';

  return 'other';
}

/**
 * Analyzes a single .spec.md file and extracts metrics.
 * @param {string} relativePath
 * @returns {SpecMetrics}
 */
function analyzeSpec(relativePath) {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  let content;
  try {
    content = fs.readFileSync(absolutePath, 'utf-8');
  } catch {
    return {
      relativePath,
      version: 'unknown',
      status: 'draft',
      classification: undefined,
      tasksTotal: 0,
      tasksCompleted: 0,
      tasksPending: 0,
      totalChanges: 0,
      changeBreakdown: { major: 0, minor: 0, patch: 0 },
      changeTypes: { discovery: 0, fix: 0, improvement: 0, documentation: 0, refactor: 0, other: 0 }
    };
  }

  // Extract version — try multiple patterns
  let version = 'unknown';
  const versionMatch = content.match(/@spec-version\s+v?(\d+\.\d+\.\d+)/);
  if (versionMatch) {
    version = versionMatch[1];
  } else {
    const specVersionMatch = content.match(/SPEC_VERSION:\s*v?(\d+\.\d+\.\d+)/i);
    if (specVersionMatch) version = specVersionMatch[1];
  }
  if (version === 'unknown') {
    // Fallback: match any standalone vX.Y.Z at the start of a line
    const fallbackMatch = content.match(/^#+?\s+v?(\d+\.\d+\.\d+)/m);
    if (fallbackMatch) version = fallbackMatch[1];
  }
  if (version === 'unknown') {
    // Fallback: match vX.Y.Z near the top of the file (first 3 lines)
    const topLines = content.split('\n').slice(0, 3).join('\n');
    const topMatch = topLines.match(/v?(\d+\.\d+\.\d+)/);
    if (topMatch) version = topMatch[1];
  }

  // Extract status — multiple formats:
  //   "SPEC_VERSION: v1.0.0 — stable"  (MDDD-CLI padrão)
  //   "*SPEC_VERSION:** v1.0.0  stable"  (Appfy/legacy)
  //   "SPEC_VERSION: v1.0.0 — draft"
  //   "**SPEC_VERSION: v1.0.0** (draft|stable)"
  let status = 'draft';
  const statusPatterns = [
    // Pattern 1: **SPEC_VERSION:** vX.Y.Z — stable|draft  (bold label format)
    /\*{0,2}SPEC_VERSION\*{0,2}:?\*{0,2}\s+v?\d+\.\d+\.\d+\s*[—–-]?\s*(draft|stable)/i,
    // Pattern 2: *SPEC_VERSION:** vX.Y.Z  stable  (Appfy/legacy — bold before and after)
    /\*{0,2}SPEC_VERSION\*{0,2}:?\*{1,2}\s+v?\d+\.\d+\.\d+\s+(draft|stable)/i,
    // Pattern 3: Title line: "# CLI Module | v6.3.0 (Stable)" or "(Draft)"
    /^#\s+.*?\(?(Stable|Draft)\)?/im,
    // Pattern 4: SPEC_VERSION: vX.Y.Z — stable|draft  (plain label, no bold)
    /SPEC_VERSION:\s*v?\d+\.\d+\.\d+\s*[—–-]\s*(draft|stable)/i,
  ];
  for (const pattern of statusPatterns) {
    const match = content.match(pattern);
    if (match) {
      status = /** @type {'draft' | 'stable'} */ (match[1].toLowerCase());
      break;
    }
  }

  // Extract classification (Coeso / Caótico)
  // Common patterns in specs:
  //   "**Classification:** Coeso"                       (English, bold label)
  //   "Classificação: **Coeso**"                         (Portuguese, bold value)
  //   "classificado como **Caótico/Acoplado**"            (Portuguese, full sentence)
  //   "Código classificado como **Caótico/Acoplado**"     (Portuguese variant)
  let classification;
  const classificationPatterns = [
    // Pattern 1: "**Classification:** Coeso" or "**Classification:** Caótico"  (English)
    /Classification:\s*\*{0,2}\s*(Coeso|Caótico)\s*\*{0,2}/i,
    // Pattern 2: "Classificação: Coeso" or "Classificação: **Coeso**" or "Classificação: **Caótico**"
    // (title line or body, with or without bold markers around the value)
    /classificaç[ãa]o:\s*\*{0,2}\s*(Coeso|Caótico)\s*\*{0,2}/i,
    // Pattern 3: "classificado como **Caótico/Acoplado**" or "Código classificado como **Coeso**"
    /classificado\s+como\s*\*\*(Caótico|Coeso)/i,
    // Pattern 4: "classificado com 'Caótico'" or "classificado com "Caótico""
    /classificado\s+com\s*['"](Caótico|Coeso)['"]/i,
  ];

  for (const pattern of classificationPatterns) {
    const match = content.match(pattern);
    if (match) {
      classification = match[1];
      break;
    }
  }

  // Heuristic fallback if no explicit classification found
  if (!classification) {
    if (/\bcaótico\b/i.test(content) && /\baco(lamento|plado)\b/i.test(content)) {
      classification = 'Caótico';
    } else if (/\bcoeso\b/i.test(content) && /\b(baixo|clean|modular|bau)\b/i.test(content)) {
      classification = 'Coeso';
    }
  }

  // Extract tasks from the Tasks section
  // Match sections like "## 4. Tasks" or "## Tasks" with checklist items
  const tasksSection = content.match(/##\s+\d*\.?\s*Tasks?\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  const tasksText = tasksSection ? tasksSection[1] : '';

  const pendingMatches = tasksText.match(/- \[ \]/g);
  const completedMatches = tasksText.match(/- \[x\]/gi);
  const tasksPending = pendingMatches ? pendingMatches.length : 0;
  const tasksCompleted = completedMatches ? completedMatches.length : 0;
  const tasksTotal = tasksPending + tasksCompleted;

  // Extract Audit History entries
  const auditSection = content.match(/(?:##\s+\d*\.?\s*(?:Audit History|Change History)\s*\n[\s\S]*?)(?=\n##\s|$)/i);
  const auditText = auditSection ? auditSection[0] : '';

  // Count data rows in the audit table (lines that start with `|` and contain a date pattern)
  const auditLines = auditText.split('\n').filter(line => {
    const trimmed = line.trim();
    // Match rows that start with `|` and contain a date like YYYY-MM-DD or a version like v1.2.3
    return /^\s*\|.*\d{4}-\d{2}-\d{2}.*\|/.test(trimmed) || /^\s*\|.*v\d+\.\d+\.\d+.*\|/.test(trimmed);
  });

  const totalChanges = auditLines.length;

  // Breakdown by MAJOR/MINOR/PATCH
  let major = 0, minor = 0, patch = 0;
  for (const line of auditLines) {
    if (/\bMAJOR\b/i.test(line) || /\bMajor\b/.test(line)) major++;
    else if (/\bMINOR\b/i.test(line) || /\bMinor\b/.test(line)) minor++;
    else if (/\bPATCH\b/i.test(line) || /\bPatch\b/.test(line)) patch++;
  }

  // Classify change types from the "Change Summary" column
  // Two common table formats:
  //   (a) Date | Agent | Version | Change Summary | Change Type |  (5 cols, summary = 2nd-to-last)
  //   (b) Data | Auditor | Versão | Resumo das Mudanças |            (4 cols, summary = last)
  // Heuristic: if last column contains MAJOR/MINOR/PATCH, it's a Change Type column → use 2nd-to-last as summary
  const changeTypes = { discovery: 0, fix: 0, improvement: 0, documentation: 0, refactor: 0, other: 0 };
  for (const line of auditLines) {
    const columns = line.split('|').map(c => c.trim()).filter(Boolean);
    if (columns.length < 2) continue;

    const lastCol = columns[columns.length - 1];
    // Detect if last column is a Change Type column (short, just MAJOR/MINOR/PATCH)
    // vs a full sentence summary that happens to mention those words
    const isChangeTypeColumn = columns.length >= 4
      && lastCol.length <= 10
      && /^(MAJOR|MINOR|PATCH)$/i.test(lastCol.trim());

    let summary;
    if (isChangeTypeColumn) {
      // Format (a): last col is Change Type (e.g. "MAJOR"), summary is 2nd-to-last
      summary = columns[columns.length - 2];
    } else {
      // Format (b) or fallback: last col is the summary itself
      summary = lastCol;
    }

    const type = classifyChangeType(summary);
    changeTypes[type]++;
  }

  return {
    relativePath,
    version,
    status,
    classification,
    tasksTotal,
    tasksCompleted,
    tasksPending,
    totalChanges,
    changeBreakdown: { major, minor, patch },
    changeTypes
  };
}

/**
 * Creates a simple text-based progress bar.
 * @param {number} completed
 * @param {number} total
 * @param {number} width
 * @returns {string}
 */
function progressBar(completed, total, width = 10) {
  if (total === 0) return '░'.repeat(width);
  const filled = Math.round((completed / total) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return `${bar} ${pct}%`;
}

/**
 * Prints the dashboard to the console.
 * @param {DashboardSummary} summary
 */
function printDashboard(summary) {
  if (summary.totalSpecs === 0) {
    console.log(pc.yellow(pc.bold('\n  ⚠️  No .spec.md files found in this project.')));
    console.log(pc.gray('  Run "md init" to create the initial specification.'));
    return;
  }

  var W = 58;

  function boxTop()  { return pc.cyan(pc.bold('  +' + '='.repeat(W) + '+')); }
  function boxBot()  { return pc.cyan(pc.bold('  +' + '='.repeat(W) + '+')); }
  function boxMid()  { return pc.cyan(pc.bold('  +' + '-'.repeat(W) + '+')); }
  function boxLine(content) {
    var visible = content.replace(/\x1b\[[0-9;]*m/g, '');
    var pad = Math.max(0, W - visible.length);
    return pc.cyan(pc.bold('  |')) + content + ' '.repeat(pad) + pc.cyan(pc.bold('|'));
  }

  function section(title) {
    console.log(boxTop());
    console.log(boxLine(pc.bold(pc.white('  ' + title))));
    console.log(boxMid());
  }

  // Header
  console.log();
  console.log(boxTop());
  console.log(boxLine(pc.bold(pc.white('  ** MDDD COVERAGE REPORT **'))));
  console.log(boxBot());
  console.log();

  // ── SPECS ──
  section('SPECS');

  var coesoC = summary.coesoCount > 0 ? pc.green : pc.gray;
  var caoticoC = summary.caoticoCount > 0 ? pc.red : pc.gray;
  var unaudC = summary.unclassifiedCount > 0 ? pc.yellow : pc.gray;

  console.log(boxLine('    ' + pc.bold(coesoC('COHESIVE'))   + '  ' + pc.bold(coesoC(String(summary.coesoCount).padStart(4)))));
  console.log(boxLine('    ' + pc.bold(caoticoC('CHAOTIC'))  + '   ' + pc.bold(caoticoC(String(summary.caoticoCount).padStart(4)))));
  console.log(boxLine('    ' + pc.bold(unaudC('UNAUDITED')) + ' ' + pc.bold(unaudC(String(summary.unclassifiedCount).padStart(4)))));
  console.log(boxMid());
  console.log(boxLine(pc.bold('    TOTAL: ' + String(summary.totalSpecs) + ' specs')));

  console.log(boxBot());
  console.log();

  // ── TASKS ──
  section('TASKS');

  if (summary.totalTasks > 0) {
    var pct = Math.round((summary.completedTasks / summary.totalTasks) * 100);
    var barW = 22;
    var filled = Math.round((summary.completedTasks / summary.totalTasks) * barW);
    var bar = '\u2588'.repeat(filled) + '\u2591'.repeat(barW - filled);

    console.log(boxLine('    ' + pc.bold(String(summary.totalTasks).padStart(4)) + ' total    ' + pc.green('done') + ' ' + pc.bold(pc.green(String(summary.completedTasks).padStart(4))) + '    ' + pc.yellow('pend') + ' ' + pc.bold(pc.yellow(String(summary.pendingTasks).padStart(4)))));
    console.log(boxLine('    ' + bar + '  ' + pc.bold(String(pct) + '%')));
  } else {
    console.log(boxLine(pc.gray('    (no tasks defined)')));
  }

  console.log(boxBot());
  console.log();

  // ── CHANGES ──
  section('VERSION CHANGES');

  if (summary.totalChanges > 0) {
    console.log(boxLine(pc.bold('    ' + String(summary.totalChanges) + ' total changes')));

    var maj = summary.totalMajors > 0 ? pc.red(pc.bold('MAJOR ' + summary.totalMajors)) : pc.gray('MAJOR 0');
    var min = summary.totalMinors > 0 ? pc.blue(pc.bold('MINOR ' + summary.totalMinors)) : pc.gray('MINOR 0');
    var pat = summary.totalPatches > 0 ? pc.green(pc.bold('PATCH ' + summary.totalPatches)) : pc.gray('PATCH 0');
    console.log(boxLine('    ' + maj + '  ' + pc.gray('|') + '  ' + min + '  ' + pc.gray('|') + '  ' + pat));
  } else {
    console.log(boxLine(pc.gray('    (no changes recorded)')));
  }

  console.log(boxBot());
  console.log();

  // ── MDDD IMPACT ──
  var impactItems = [];
  if (summary.totalDiscoveries > 0) impactItems.push({icon: '>>>', label: 'DISCOVERIES', value: summary.totalDiscoveries, color: pc.green});
  if (summary.totalFixes > 0) impactItems.push({icon: '>>>', label: 'FIXES', value: summary.totalFixes, color: pc.yellow});
  if (summary.totalImprovements > 0) impactItems.push({icon: '>>>', label: 'IMPROVEMENTS', value: summary.totalImprovements, color: pc.blue});
  if (summary.totalDocumentation > 0) impactItems.push({icon: '>>>', label: 'DOCUMENTATION', value: summary.totalDocumentation, color: pc.cyan});
  if (summary.totalRefactors > 0) impactItems.push({icon: '>>>', label: 'REFACTORS', value: summary.totalRefactors, color: pc.magenta});

  section('MDDD IMPACT');

  if (impactItems.length > 0) {
    for (var i = 0; i < impactItems.length; i++) {
      var it = impactItems[i];
      var label = pc.bold(it.color(it.label.padEnd(16)));
      var val = pc.bold(it.color(String(it.value)));
      console.log(boxLine('    ' + it.icon + '  ' + label + ' ' + val));
    }
  } else {
    console.log(boxLine(pc.gray('    (no impact metrics yet)')));
  }

  console.log(boxBot());
  console.log();

  // ── CRITICAL POINTS ──
  if (summary.criticalPoints.length > 0) {
    var draftByDomain = new Map();
    var caoticoList = [];
    var pendingList = [];

    for (var j = 0; j < summary.criticalPoints.length; j++) {
      var pt = summary.criticalPoints[j];
      if (pt.indexOf('CAOTICO') !== -1 || pt.indexOf('CAÓTICO') !== -1) caoticoList.push(pt);
      else if (pt.indexOf('pending tasks') !== -1) pendingList.push(pt);
      else if (pt.indexOf('DRAFT') !== -1) {
        var pts = pt.split(' — ');
        var dom = pts[0].split('/')[0];
        if (!draftByDomain.has(dom)) draftByDomain.set(dom, []);
        draftByDomain.get(dom).push(pts[0]);
      }
    }

    section('CRITICAL POINTS');

    for (var k = 0; k < caoticoList.length; k++) {
      var cp = caoticoList[k].split(' — ');
      console.log(boxLine('    ' + pc.red(pc.bold('!!!  ' + (cp[0] || '')))));
      if (cp[1]) console.log(boxLine('        ' + pc.red(cp[1])));
    }

    var maxShow = 5;
    var showItems = pendingList.slice(0, maxShow);
    var moreCount = pendingList.length - maxShow;
    for (var m = 0; m < showItems.length; m++) {
      var pp = showItems[m].split(' — ');
      var tm = pp[1] ? pp[1].match(/(\d+) pending/) : null;
      var pendingNum = tm ? tm[1] : '0';
      var filePath = pp[0] || '';
      var maxPathLen = W - 22;
      if (filePath.length > maxPathLen) filePath = '...' + filePath.slice(-(maxPathLen - 3));
      console.log(boxLine('    ' + pc.yellow(pc.bold('PENDING ' + filePath)) + '  ' + pc.bold(pc.yellow(pendingNum))));
    }
    if (moreCount > 0) {
      console.log(boxLine(pc.gray('        ... and ' + moreCount + ' more specs')));
    }

    var draftCount = 0;
    for (var d of draftByDomain.values()) draftCount += d.length;
    if (draftCount > 0) {
      var domainArr = [];
      for (var entry of draftByDomain) {
        domainArr.push({domain: entry[0], count: entry[1].length});
      }
      domainArr.sort(function(a, b) { return b.count - a.count; });
      var domainStr = domainArr.map(function(e) {
        return pc.bold(pc.cyan(e.domain)) + pc.gray('(' + e.count + ')');
      }).join(' ');
      console.log(boxLine(pc.bold(pc.cyan('    DRAFT: ' + String(draftCount) + ' specs'))));
      // Truncate domain summary if too long
      if (domainStr.length > W - 12) {
        domainStr = domainStr.slice(0, W - 15) + '...';
      }
      console.log(boxLine('        ' + domainStr));
    }

    console.log(boxBot());
    console.log();
  }

  // ── Footer ───────────────────────────────────────
  var versions = summary.specs.map(function(s) { return s.version; }).filter(function(v) { return v !== 'unknown'; });
  var versionRange;
  if (versions.length > 0) {
    var sorted = versions.sort(function(a, b) {
      var ap = a.split('.').map(Number);
      var bp = b.split('.').map(Number);
      if (ap[0] !== bp[0]) return ap[0] - bp[0];
      if (ap[1] !== bp[1]) return ap[1] - bp[1];
      return ap[2] - bp[2];
    });
    versionRange = 'v' + sorted[0] + ' -> v' + sorted[sorted.length - 1];
  } else {
    versionRange = 'no version data';
  }

  console.log(pc.gray('  ' + '-'.repeat(W)));
  console.log(pc.gray('  MDDD Protocol  ·  ' + summary.specs.length + ' specs  ·  ' + versionRange));
  console.log(pc.gray('  Generated: ' + new Date().toISOString().split('T')[0]));
  console.log();
}
/**
 * Executes the `md status` command.
 * @param {{ findSpecs: (rootDir: string) => string[] }} specFinder
 * @returns {Promise<DashboardSummary>}
 */
export async function execute(specFinder) {
  const specs = specFinder.findSpecs(process.cwd());

  if (specs.length === 0) {
    const emptySummary = {
      totalSpecs: 0,
      coesoCount: 0,
      caoticoCount: 0,
      unclassifiedCount: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      totalChanges: 0,
      totalDiscoveries: 0,
      totalFixes: 0,
      totalImprovements: 0,
      totalDocumentation: 0,
      totalRefactors: 0,
      totalMajors: 0,
      totalMinors: 0,
      totalPatches: 0,
      criticalPoints: [],
      specs: []
    };
    printDashboard(emptySummary);
    return emptySummary;
  }

  // Analyze each spec
  const metricsList = specs.map(spec => analyzeSpec(spec));

  // Aggregate into summary
  /** @type {DashboardSummary} */
  const summary = {
    totalSpecs: metricsList.length,
    coesoCount: metricsList.filter(m => m.classification === 'Coeso').length,
    caoticoCount: metricsList.filter(m => m.classification === 'Caótico').length,
    unclassifiedCount: metricsList.filter(m => !m.classification).length,
    totalTasks: metricsList.reduce((acc, m) => acc + m.tasksTotal, 0),
    completedTasks: metricsList.reduce((acc, m) => acc + m.tasksCompleted, 0),
    pendingTasks: metricsList.reduce((acc, m) => acc + m.tasksPending, 0),
    totalChanges: metricsList.reduce((acc, m) => acc + m.totalChanges, 0),
    totalDiscoveries: metricsList.reduce((acc, m) => acc + m.changeTypes.discovery, 0),
    totalFixes: metricsList.reduce((acc, m) => acc + m.changeTypes.fix, 0),
    totalImprovements: metricsList.reduce((acc, m) => acc + m.changeTypes.improvement, 0),
    totalDocumentation: metricsList.reduce((acc, m) => acc + m.changeTypes.documentation, 0),
    totalRefactors: metricsList.reduce((acc, m) => acc + m.changeTypes.refactor, 0),
    totalMajors: metricsList.reduce((acc, m) => acc + m.changeBreakdown.major, 0),
    totalMinors: metricsList.reduce((acc, m) => acc + m.changeBreakdown.minor, 0),
    totalPatches: metricsList.reduce((acc, m) => acc + m.changeBreakdown.patch, 0),
    criticalPoints: [],
    specs: metricsList
  };

  // Build critical points
  for (const m of metricsList) {
    if (m.totalChanges === 0) {
      summary.criticalPoints.push(`${m.relativePath} — No Audit History (0 changes)`);
    }
    if (m.tasksPending > 5) {
      summary.criticalPoints.push(`${m.relativePath} — ⚠️ ${m.tasksPending} pending tasks`);
    }
    if (m.classification === 'Caótico') {
      summary.criticalPoints.push(`${m.relativePath} — Classified as CAÓTICO`);
    }
    if (m.status === 'draft') {
      summary.criticalPoints.push(`${m.relativePath} — Still in DRAFT status`);
    }
  }

  printDashboard(summary);
  return summary;
}