# Audit: cli | v1.0.0

## 1. Flow Contract (Mermaid)

### 1.1 Topologia Atual (As-Is)

```mermaid
%% @spec-version v1.0.0
graph TD
    subgraph "CLI Entry (cli.js)"
        A[index.js#!/usr/bin/env node] --> B[Commander: program.parse]
    end

    subgraph "Command Routing"
        B --> C[md init]
        B --> D[md new <path>]
        B --> E[md edit <spec> <instruction>]
        B --> F[md audit <codeFile>]
        B --> G[md impl <spec>]
    end

    subgraph "md init Action"
        C --> H[mkdir .agents/skills]
        C --> I[Write system_prompt.md]
        C --> J[Write 4 embedded SKILL.md files]
    end

    subgraph "md new Action"
        D --> K[Normalize path]
        K --> L{folder exists?}
        L -->|NO| M[mkdir -p]
        L -->|YES| N[skip mkdir]
        M --> O[Build .spec.md template]
        N --> O
        O --> P{--macro flag?}
        P -->|YES| Q[stateDiagram-v2 template]
        P -->|NO| R[graph LR + Decision Matrix template]
        Q --> S[Write file]
        R --> S
        S --> T{--parent or findClosestMacro?}
        T -->|Found| U[Append link to parent .spec.md]
        T -->|Not Found| V[Done]
    end

    subgraph "Utility Functions"
        X[findClosestMacro] --> Y[walk dir up]
        Y --> Z{find *.spec.md?}
        Z -->|Found| AA[return path]
        Z -->|Not Found| AB[return null]
    end

    subgraph "md edit Action"
        E --> AC[validate file exists]
        AC --> AD[print placeholder message]
    end

    subgraph "md audit Action"
        F --> AE[validate file exists]
        AE --> AF{spec exists?}
        AF -->|NO| AG[write template spec]
        AF -->|YES| AH[print found message]
        AG --> AI[print 'AI will analyze' message]
        AH --> AI
    end

    subgraph "md impl Action"
        G --> AJ[validate file exists]
        AJ --> AK[print placeholder message]
    end
```

### 1.2 Topologia Refatorada Proposta (To-Be)

```mermaid
%% @spec-version v1.0.0
graph TD
    subgraph "CLI Entry (cli.js)"
        A[bin/cli.js] --> B[Commander Router]
        B --> C[delegate to ./commands/init.js]
        B --> D[delegate to ./commands/new.js]
        B --> E[delegate to ./commands/edit.js]
        B --> F[delegate to ./commands/audit.js]
        B --> G[delegate to ./commands/impl.js]
    end

    subgraph "Commands Layer"
        C --> H[InitService.createSystemPrompt]
        C --> I[InitService.createSkills]
        D --> J[SpecGenerator.create]
        D --> K[ParentLinker.link]
        E --> L[SpecValidator.validate]
        E --> M[SpecEditor.prepareInstruction]
        F --> N[AuditService.run]
        F --> O[SpecGenerator.createIfMissing]
        G --> P[ImplValidator.validate]
    end

    subgraph "Shared Services"
        H --> Q[FileSystemService]
        I --> Q
        J --> Q
        K --> Q
        L --> Q
        N --> Q
        O --> Q
        P --> Q
        Q --> R[fs/promises]

        subgraph "Template Engine"
            S[TemplateFactory] --> T[MacroTemplate: stateDiagram-v2]
            S --> U[MicroTemplate: graph LR + DecisionMatrix]
            S --> V[AuditTemplate: graph LR + AuditHistory]
        end
    end

    subgraph "Tests (Unit)"
        W[SpecGenerator.test.js]
        X[ParentLinker.test.js]
        Y[AuditService.test.js]
        Z[TemplateFactory.test.js]
    end
```

## 2. Decision Matrix

| Código Atual | Co-located .spec.md Exists? | Design Assessment | Ação de Auditoria | Manipulação de Código Permitida? | Versão Inicial |
| :--- | :---: | :---: | :--- | :---: | :---: |
| `bin/cli.js` (421 linhas) | ❌ NO | Caótico / Acoplado | Auto-gerar Spec + Mapear Lógica Atual E Proposta | ❌ **FORBIDDEN (Immutability)** | `v1.0.0` |

### Fatores Primitivos de Acoplamento

| Fator | Valor | Impacto |
| :--- | :---: | :--- |
| Arquivo único monolítico? | ✅ YES | Acoplamento extremo; todas as responsabilidades no mesmo closure |
| Lógica de template embutida? | ✅ YES | 4 skills + 2 templates inline no código (string templates >20KB) |
| Duplicação entre `new` e `audit`? | ✅ YES | Ambos criam `.spec.md` com templates semelhantes |
| Tratamento de erros inconsistente? | ✅ YES | `edit`/`audit`/`impl` usam `process.exit(1)`, `new` usa `process.exit(0/1)` |
| Sem separação CLI/Business? | ✅ YES | Comandos Commander executam lógica inline sem camada de serviço |
| Lógica de crawling de diretório isolada? | ❌ NO | `findClosestMacro` é função separada (bom), mas não testável isoladamente |
| Código testável? | ❌ NO | Sem módulos exportados; dependência direta de `fs`, `path` sem injeção |

## 3. Audit History

<details>
<summary>Click to expand</summary>

| Data | Auditor | Versão | Resumo das Mudanças |
| :--- | :--- | :---: | :--- |
| 2026-05-27 | MDDD-Audit Agent (Cline) | v1.0.0 | Auditoria inicial. Código classificado como **Caótico/Acoplado**. Diagrama As-Is documenta a topologia real (monolítica). Diagrama To-Be propõe separação em Commands Layer + Shared Services + Template Engine + Testes. Decisão de imutabilidade: código de produção não foi modificado. |

### Análise de Qualidade

- **Acoplamento**: ⚠️ **ALTO** - Toda lógica em um único arquivo de 421 linhas. Dependências diretas de `fs`, `path` e `Commander` sem abstração.
- **Coesão**: ⚠️ **BAIXA** - O comando `init` mistura criação de sistema de arquivos, templates de sistema e escrita de skills.
- **Testabilidade**: ❌ **NENHUMA** - Nenhuma função é exportada; sem DI (injeção de dependência); sem mocks possíveis sem ferramentas como `proxyquire`.
- **Manutenibilidade**: ⚠️ **MÉDIA-BAIXA** - Templates embutidos no código dificultam manutenção; lógica de crawling de diretório é frágil (usa `readdirSync`).
- **Segurança**: ✅ Usa `EACCES`/`EPERM` handler no `findClosestMacro`.

### Recomendações de Refatoração

1. **Separar em módulos**: `src/commands/init.js`, `src/commands/new.js`, `src/commands/edit.js`, `src/commands/audit.js`, `src/commands/impl.js`
2. **Extrair Template Engine**: `src/services/TemplateFactory.js` com templates parametrizados
3. **Extrair FileSystemService**: `src/services/FileSystemService.js` com injeção de dependência para testabilidade
4. **Criar ParentLinker**: `src/services/ParentLinker.js` com crawler testável
5. **Adicionar testes unitários**: Coverage mínimo de 80% para todas as funções extraídas
6. **Exportar funções**: Usar `export` em vez de closures anônimas no `.action()`
7. **Migrar para `fs/promises`**: Substituir `readdirSync`/`writeFileSync` por `async/await` para melhor gerenciamento de concorrência

</details>