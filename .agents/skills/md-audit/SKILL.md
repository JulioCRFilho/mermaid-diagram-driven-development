[ROLE: SECURITY & QUALITY AUDITOR] [STRICT CONTRACT]

```mermaid
%% @spec-version v1.1.0
stateDiagram-v2
    [*] --> AnalyzeLegacyCode: Evaluate Coupling & Scope Leaks
    AnalyzeLegacyCode --> FileSystemCheck
    
    state FileSystemCheck {
        [*] --> CheckCoLocation
        CheckCoLocation --> CreateMissingSpec: Target Co-located .spec.md Missing
        CheckCoLocation --> AppendToExisting: Target Co-located .spec.md Exists
    }
    
    CreateMissingSpec --> RenderTopology: Initialize New .spec.md
    AppendToExisting --> InjectAuditBlock: Target Existing File Preservation Map
    
    state RenderTopology {
        [*] --> CodeIsClean: Map exact architecture as-is (v1.0.0)
        [*] --> CodeIsChaotic: Draw BOTH current real logic AND ideal target refactored graph
    }
    
    RenderTopology --> WriteToAuditTag: Inject payloads inside <details> block
    InjectAuditBlock --> WriteToAuditTag: Append to existing <details> block without overwriting business specs
    WriteToAuditTag --> EnforceImmutability: Lock Production Code File
    EnforceImmutability --> [*]
```

### Reverse Engineering & Auto-Repair Decision Matrix

| Source File State | Co-located .spec.md Exists? | Code Design Assessment | Target Output Destination | Code File Manipulation Allowed? | Initial Compiled Version |
| :--- | :---: | :---: | :--- | :---: | :---: |
| Legacy Code Active | ✅ YES | Clean / Modular | Append to existing `<details><summary>Audit History</summary>` | ❌ **FORBIDDEN (Immutability)** | Retain Current |
| Legacy Code Active | ✅ YES | Chaotic / Coupled | Append to existing `<details><summary>Audit History</summary>` | ❌ **FORBIDDEN (Immutability)** | Retain Current |
| Legacy Code Active | ❌ NO | Clean / Modular | Auto-generate Spec File + Map Current Logic | ❌ **FORBIDDEN (Immutability)** | `v1.0.0` |
| Legacy Code Active | ❌ NO | Chaotic / Coupled | Auto-generate Spec File + Map Current AND Proposed Logic | ❌ **FORBIDDEN (Immutability)** | `v1.0.0` |

### Missing Spec Auto-Repair Blueprint Requirements
* **Enforce Section Injections:** Every auto-generated specification file must structurally enforce: 
  1. `SPEC_VERSION: v1.0.0` metadata header at the very top.
  2. `stateDiagram-v2` or `graph LR` derived exactly from code logic behaviors.
  3. `Decision Matrix` tables filled if the code contains conditional execution branches.
  4. An isolated `<details><summary>Audit History</summary>...</details>` block at the bottom containing the specific code review analytics.

### Quality Assurance & Immutability Ironclad Rules
1. **Absolute Immutability Command:** Under no circumstances are you allowed to patch, alter, or modify the target production code file during the `md-audit` cycle. Your execution scope is strictly limited to observation and documentation within the Markdown specification file.
2. **Preservation Guarantee:** When appending an audit report to an existing `.spec.md` file, you must read the file completely and guarantee that the business requirements, main diagrams, and current decision matrices are left untouched. You are only allowed to inject rows inside the `<details>` audit history block.
3. **Chaotic Code Double-Mapping:** If you evaluate the legacy code as chaotic or highly coupled, you must not replace the current reality with your ideal version. You are required to draw the current graph (flawed as it is) to serve as a baseline, and then provide a separate, clearly labeled Mermaid graph showing the suggested refactored topology.