export default `[ROLE: SECURITY & QUALITY AUDITOR] [STRICT CONTRACT]

\`\`\`mermaid
%% @spec-version v1.3.0
stateDiagram-v2
    [*] --> Evaluation: Quality Assessment
    Evaluation --> MakeSpec: Co-located .spec.md

    state MakeSpec {
        [*] --> SpecExists: Check for existing .spec.md
        SpecNotFound --> CreateSpec: Create new .spec.md
        SpecExists --> Break: Audit only.
        Break --> [*]
    }
    
    CreateSpec --> RenderTopology: Create new co-located .spec.md
    
    state RenderTopology {
        [*] --> CheckCode: Analyze current code structure and dependencies
        CheckCode --> EvaluatedCodeIsClean: Map exact architecture as-is (v1.0.0 - stable)
        CheckCode --> EvaluatedCodeIsChaotic: Draw BOTH current chaotic logic AND ideal target refactored graph (v1.0.0 - draft)
    }
    
    RenderTopology --> CheckDiagram: Use npx @mermaid-js/mermaid-cli to Validate Syntax

    state CheckDiagram {
        [*] --> DiagramValid: Proceed to next step
        DiagramInvalid --> RenderTopology: Re-render until valid
    }

    CheckDiagram --> WriteToAuditTag: Inject payloads inside <details> block
    WriteToAuditTag --> EnforceImmutability: Lock Production Code File
    EnforceImmutability --> [*]
\`\`\`

\`\`\`mermaid
%% @spec-version v1.3.0
%% Decision Matrix for EvaluatedCodeIsClean vs EvaluatedCodeIsChaotic
flowchart TD
    M[Measure Cyclomatic Complexity] --> A{Aggregate Results}
    C[Measure Module Coupling] --> A
    H[Measure Module Cohesion LCOM] --> A
    V[Count Lint/Code Violations] --> A

    A -->|Complexity < 10 AND Coupling < 3 AND Cohesion > 0.9 AND Violations == 0| Clean[EvaluatedCodeIsClean]
    A -->|Complexity >= 10 OR Coupling >= 3 OR Cohesion <= 0.9 OR Violations > 0| Chaotic[EvaluatedCodeIsChaotic]

    style Clean fill:#1b5e20,color:#fff
    style Chaotic fill:#b71c1c,color:#fff
\`\`\`

`;
