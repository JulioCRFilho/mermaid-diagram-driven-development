[ROLE: ARCHITECT] [STRICT CONTRACT]

```mermaid
%% @spec-version v1.2.0
graph LR
    A[Read Target .spec.md] --> B[Parse Current SPEC_VERSION]
    B --> C[Apply Mermaid/Matrix Adjustments]
    C --> D{Evaluate Mutation Scope}
    
    D -->|Typo / Label Fix| E[Increment Patch: Bump Z in X.Y.Z]
    D -->|New Node / Flow Path / Factor| F[Increment Minor: Bump Y in X.Y.Z]
    D -->|Breaking Overhaul / Restructure| G[Increment Major: Bump X in X.Y.Z]
    
    E --> H[Validate Mermaid Syntax]
    F --> H
    G --> H
    
    H -->|Syntax Valid| I[Write .spec.md to Disk with Updated Version]
    H -->|Syntax Invalid| J[🛑 HALT: Abort & Ask Human]
    I --> K{Spec Status Assessment}
    K -->|Is draft| L[Tag as draft proposal - AWAIT_USER_VALIDATION]
    K -->|Is stable| M[Tag as stable - STALE_LOCKED]
    L --> N[Append Audit History Entry]
    M --> N
    N --> O[Persist Updated File]
    O --> [*]
```

### Evolution Versioning Matrix

| Structural Change Type | Adds Factor Column? | Adds Transition Node/Arrow? | Label / Typo Corrections Only? | Semantic Version Modification | Spec Status After Edit | Target AI State |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Complete Business Overhaul | - | - | - | **MAJOR Mutation (X.Y.Z -> X+1.0.0)** | **draft** (proposal) | ⏳ **AWAIT_USER_VALIDATION** |
| New Context Conditional Branch | ✅ YES | - | - | **MINOR Mutation (X.Y.Z -> X.Y+1.0)** | **draft** (proposal) | ⏳ **AWAIT_USER_VALIDATION** |
| New UI Flow Step / Lifecycle State | ❌ NO | ✅ YES | - | **MINOR Mutation (X.Y.Z -> X.Y+1.0)** | **draft** (proposal) | ⏳ **AWAIT_USER_VALIDATION** |
| Visual Spacing / Text Refinement | ❌ NO | ❌ NO | ✅ YES | **PATCH Mutation (X.Y.Z -> X.Y.Z+1)** | **stable** (locked) | ✅ **STABLE_LOCKED** |

### Mutation Integrity Ironclad Rules
1. **Incremental SemVer Locking:** You must read the existing `SPEC_VERSION` from the file header before modifying it. Never reset, guess, or overwrite the version to a lower state. Bumping Minor explicitly drops the patch version to zero (`X.Y.Z` -> `X.Y+1.0`). Bumping Major explicitly drops both minor and patch to zero (`X.Y.Z` -> `X+1.0.0`).
2. **Strict Syntax Guard:** Before writing the modifications to disk, execute an internal mental compilation of the Mermaid syntax. If any arrow (`-->`), state connector, or label syntax breaks the official Mermaid spec, immediately halt execution and report the error to the user without modifying the file.
3. **Audit History Log Requirement:** Every time you perform an edit, you must append a new row to the markdown table inside the `<details><summary>Click to expand</summary>...</details>` block at the bottom of the file, containing the current date, your agent identity, the new version number, and a concise summary of the changes made.
4. **Node ID Immutability:** When adding new transitions or nodes to an existing graph, you are strictly forbidden from altering, renaming, or refactoring the identifiers (IDs) of existing states/nodes unless explicitly requested by the user.
5. **Draft vs Stable Status Tagging:** Every edited `.spec.md` file MUST have its status explicitly declared after the `SPEC_VERSION` header. Structural changes (major/minor) that alter behavior MUST be tagged as `draft` (proposal) until the corresponding code is implemented and verified. Non-structural changes (patch/typographical) may remain or become `stable` (locked) immediately. The status format is: `**SPEC_VERSION: vX.Y.Z — [draft|stable]**`.
6. **Spec File Write Mandate:** After computing the new version and validating syntax, you **MUST** write the updated `.spec.md` file to disk. The edit cycle is not complete until the file is persisted with the updated version header, modified diagram/matrix, and audit history entry.