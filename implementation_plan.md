# Implementation Plan

Adicionar o comando `md status` ao CLI MDDD, que varre todos os `.spec.md` do projeto e gera um relatório visual consolidado com métricas de cobertura do protocolo MDDD: discoveries, fixes, melhorias, documentação, refactors, fluxos detectados, tasks pendentes/concluídas, e evolução de versões.

O comando aproveita o `list-specs` existente (que retorna a lista de `.spec.md` via `SpecFinderService`), lê o conteúdo de cada spec, extrai métricas da seção **Tasks** (checklists pendentes/concluídas) e do **Audit History** (entradas de changelog classificadas por tipo), e exibe um dashboard colorido no terminal com `picocolors`. O foco é mostrar o valor que o MDDD trouxe — não detalhes internos de cada spec, mas uma visão geral com indicadores agregados. Pontos críticos (specs sem tasks, specs sem audit history, versões muito antigas) são destacados em destaque (amarelo/vermelho).

[Types]

Nenhum novo tipo/interface complexa — a análise é feita via parsing de markdown e regex. Haverá uma estrutura interna (não exportada) para agregar as métricas:

```
SpecMetrics {
  relativePath: string;
  version: string;           // e.g. "v6.2.2"
  status: 'draft' | 'stable';
  classification: 'Coeso' | 'Caótico' | undefined;  // from spec body text
  tasksTotal: number;
  tasksCompleted: number;
  tasksPending: number;
  totalChanges: number;
  changeBreakdown: {
    major: number;
    minor: number;
    patch: number;
  };
  changeTypes: {
    discovery: number;
    fix: number;
    improvement: number;
    documentation: number;
    refactor: number;
    other: number;
  };
}

DashboardSummary {
  totalSpecs: number;
  coesoCount: number;
  caoticoCount: number;
  undiscoveredCount: number;  // specs without classification
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalChanges: number;
  totalDiscoveries: number;
  totalFixes: number;
  totalImprovements: number;
  totalDocumentation: number;
  totalRefactors: number;
  totalMajors: number;
  totalMinors: number;
  totalPatches: number;
  criticalPoints: string[];  // warnings for human attention
}
```

[Files]

Novos arquivos a criar e arquivos existentes a modificar:

### New Files

1. **`src/commands/status.js`** — Handler do comando `md status`. Chama `specFinderService.findSpecs()` para obter a lista de specs, itera sobre cada um, extrai métricas via parsing de markdown, agrega em `DashboardSummary`, e imprime o dashboard colorido. Não cria serviço separado — a lógica de parsing é encapsulada neste mesmo arquivo (coeso e enxuto).

2. **`src/commands/status.spec.md`** — Spec co-localizado para o comando `status`, seguindo o padrão MDDD: Behavioral Flow (Mermaid), Decision Matrix, Tasks, Audit History.

3. **`tests/commands/status.spec.js`** — Testes unitários para o comando `status`, testando parsing de markdown e a saída do dashboard.

### Modified Files

4. **`bin/cli.js`** — Adicionar import e registro do comando `status` no Commander, seguindo o mesmo padrão dos comandos `validate` e `list-specs`.

5. **`bin/cli.spec.md`** — Atualizar diagrama de topologia para incluir o novo nó `status.js`, atualizar Decision Matrix com a nova linha para `status.js`, e adicionar entrada no Audit History.

[Functions]

Novas funções e modificações em funções existentes.

### New Functions (in `src/commands/status.js`)

1. **`execute(specFinderService)`** — `async (specFinderService: SpecFinderService) => Promise<void>`
   - Ponto de entrada do comando. Chama `specFinderService.findSpecs(process.cwd())`, itera sobre cada spec, chama `#analyzeSpec(relativePath)`, agrega resultados em `DashboardSummary`, chama `#printDashboard(summary)`.

2. **`#analyzeSpec(relativePath)`** — `(relativePath: string) => SpecMetrics`
   - Lê o arquivo `.spec.md` via `fs.readFileSync`, extrai com regex:
     - `version`: da primeira linha que casa `@spec-version v(\d+\.\d+\.\d+)` ou `SPEC_VERSION: v(\d+\.\d+\.\d+)`
     - `status`: `'draft' | 'stable'` do header `SPEC_VERSION: vX.Y.Z — (draft|stable)`
     - `classification`: da ocorrência de "Coeso" ou "Caótico" no corpo do texto (geralmente na Audit History)
     - `tasksTotal`, `tasksCompleted`, `tasksPending`: contagem de `- [ ]` (pendentes) e `- [x]` (completadas) na seção "Tasks" ou "## 4. Tasks"
     - `totalChanges`: contagem de linhas na tabela Audit History (excluindo cabeçalho e separador)
     - `changeBreakdown`: parsing de `MAJOR`, `MINOR`, `PATCH` nas colunas de tipo de mudança
     - `changeTypes`: classifica cada entry do Audit History por keywords no "Change Summary":
       - "discovery"/"descoberta"/"found"/"encontrado" → `discovery`
       - "fix"/"bug"/"correção"/"corrigido" → `fix`
       - "improvement"/"melhoria"/"enhance"/"refinamento" → `improvement`
       - "documentation"/"doc"/"docs"/"diagram"/"documentação" → `documentation`
       - "refactor"/"refatoração"/"reestrutura"/"simplifica" → `refactor`
       - padrão → `other`

3. **`#classifyChangeType(summary)`** — `(summary: string) => string`
   - Helper que aplica as regras de keyword matching para classificar uma entry do Audit History.

4. **`#printDashboard(summary)`** — `(summary: DashboardSummary) => void`
   - Imprime o dashboard final no terminal usando `picocolors`. Estrutura:
     ```
     ╔══════════════════════════════════════════╗
     ║        📊 MDDD Coverage Report           ║
     ╚══════════════════════════════════════════╝

     📁 Specs Found: 5
       🟢 Coeso: 3 | 🔴 Caótico: 1 | ⚪ Unclassified: 1

     📋 Tasks: 45 total
       ✅ Completed: 32 (71%)
       ⏳ Pending: 13

     📈 Changes: 28 total
       🔄 MAJOR: 3 | 🔄 MINOR: 15 | 🔄 PATCH: 10

     🎯 Discoveries: 5
     🔧 Fixes: 8
     ✨ Improvements: 10
     📝 Documentation: 3
     🔨 Refactors: 2

     ⚠️ Critical Points:
       • src/legacy/module.spec.md — No Audit History (0 changes)
       • bin/cli.spec.md — ⚠️ 13 pending tasks
       • src/services/OrphanService.spec.md — Classified as CAÓTICO

     Generated by MDDD Protocol — v6.2.2
     ```
   - Usa `pc.green`, `pc.yellow`, `pc.red`, `pc.cyan`, `pc.gray`, `pc.bold`, `pc.italic`.
   - Barras de progresso para tasks (ex: `████████░░ 71%`).
   - Se `totalSpecs === 0`, imprime `pc.yellow('⚠️ No .spec.md files found in this project.')`.

### Modified Functions

5. **`bin/cli.js`** — Adicionar no topo:
   ```js
   import * as statusCmd from '../src/commands/status.js';
   ```
   E o bloco do comando:
   ```js
   program
     .command('status')
     .description('Generate a beautiful MDDD coverage report with metrics from all .spec.md files')
     .action(async () => {
       try {
         await statusCmd.execute(specFinderService);
         process.exit(0);
       } catch (err) {
         console.error(pc.red(`❌ ${err.message}`));
         process.exit(1);
       }
     });
   ```
   Posicionado após o comando `list-specs` e antes do `program.parse`.

[Classes]

Nenhuma nova classe. O comando `status` é implementado como funções exportadas em `src/commands/status.js`, seguindo o mesmo padrão de `listSpecs.js` e `init.js`. `SpecFinderService` já existe e é reutilizado.

[Dependencies]

Nenhuma nova dependência. O comando usa apenas:
- `node:fs` e `node:path` (módulos nativos)
- `picocolors` (já presente em `package.json`)

[Testing]

Testes unitários em `tests/commands/status.spec.js` usando `node:test` e `node:assert/strict`.

### Cenários de teste:

1. **Dashboard com specs** — Cria diretório temporário com 2 `.spec.md` (um com tasks completadas + audit history, outro com tasks pendentes + classificação "Caótico"). Verifica se a saída JSON do dashboard contém as métricas corretas.

2. **Nenhum spec encontrado** — Cria diretório temporário vazio. Verifica se o comando imprime `⚠️ No .spec.md files found`.

3. **Spec sem Audit History** — Cria spec com apenas cabeçalho e tasks. Verifica se as métricas de change/breakdown são zero.

4. **Classificação change type** — Testa o `#classifyChangeType` com diferentes summaries (contendo "fix", "refactor", "discovery", etc.).

5. **Parsing de versão** — Testa extração de `@spec-version v1.2.3` e `SPEC_VERSION: v4.5.6 — stable`.

### Como testar:

```bash
node --test tests/commands/status.spec.js
```

Ou manualmente:
```bash
node bin/cli.js status
```

[Implementation Order]

A implementação deve seguir esta ordem para minimizar conflitos:

1. **Criar `src/commands/status.js`** — Com toda a lógica de análise e dashboard.
2. **Criar `src/commands/status.spec.md`** — Spec co-localizado.
3. **Editar `bin/cli.js`** — Adicionar o comando `status` ao Commander.
4. **Editar `bin/cli.spec.md`** — Atualizar diagrama, matrix e audit history.
5. **Criar `tests/commands/status.spec.js`** — Testes unitários.
6. **Rodar testes e validar** — `node --test tests/commands/status.spec.js` e `node bin/cli.js status`.