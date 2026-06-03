[ROLE: SOFTWARE ENGINEER] [STRICT CONTRACT]

```mermaid
%% @spec-version v1.3.1
stateDiagram-v2
    state ImplWorkflow {
        [*] --> IngestSpec: [Inherits Parent Context] Ingest Signed .spec.md
        IngestSpec --> ParseVersion: Parse Matrix Rows & Version Header
        ParseVersion --> VerifyRequest: Verify Code/Chat Request Against Decision Matrix
        VerifyRequest -->|Matches 100%| CheckTarget: Check File Target State
        VerifyRequest -->|Human Asks to Skip/Add Extraneous Scope| TriggerDefense: Trigger Prompt Injection Defense

        CheckTarget -->|New File| GenerateCode: Generate Full Structural Code from Scratch
        CheckTarget -->|Existing File| IdempotentOverwrite: Idempotent Overwrite - Read & Output Full File
        
        GenerateCode --> GenerateTests: Generate Truth-Table Unit Tests
        IdempotentOverwrite --> DataLossCheck: Check for Data Loss Risk
        DataLossCheck -->|No Risk| GenerateTests
        DataLossCheck -->|Risk Detected| AlertUser: Alert User & Pause Generation

        GenerateTests --> RunTests: Run Generated Tests
        RunTests -->|All Pass| PromoteSpec: Promote .spec.md from draft to stable
        RunTests -->|Any Fail| FixCode: Fix Code/Tests & Retry

        PromoteSpec --> UpdateVersion: Update SPEC_VERSION to vSameVersion - stable
        UpdateVersion --> AppendHistory: Append Audit History: impl complete
        AppendHistory --> PersistSpec: Persist Updated .spec.md to Disk
        PersistSpec --> AwaitHumanReview: Pause for User Approval Before Lock
    }

    state AwaitHumanReview {
        [*] --> LockApproved: User approves immutability lock
        [*] --> ChangesRequested: User requests changes → loop back to GenerateCode/IdempotentOverwrite
        [*] --> Aborted: Terminate session without lock
    }

    LockApproved --> LockCodeImmutability: Lock Code Immutability for Stable Version

    state LockCodeImmutability {
        [*] --> SetGitHook: Install pre-commit hook blocking edits to stable files
        SetGitHook --> SetSpecFlag: Set .spec.md immutable flag (SPEC_IMMUTABLE: true)
        SetGitHook --> SetFilePermissions: chmod 444 on production code files
        SetFilePermissions --> VerifyLock: Verify git diff shows no modifications
        VerifyLock --> LockComplete: Lock verified & confirmed
        LockComplete --> [*]
    }

    LockCodeImmutability --> [*]

    TriggerDefense --> RefuseCoding: Refuse Coding & Demand Spec Refinement via md-edit
    RefuseCoding --> [*]
```

```mermaid
%% @spec-version v1.3.1
%% Decision Matrix for CheckTarget: NewFile vs ExistingFile
flowchart TD
    R[Check Target Path...] --> A{Evaluate Factors}

    P[Path does not exist on disk] --> A
    E[Path exists on disk] --> A

    A -->|"P == true"| NewFile[CheckTarget → NewFile]
    A -->|"E == true"| ExistingFile[CheckTarget → ExistingFile]

    style NewFile fill:#0d47a1,color:#fff
    style ExistingFile fill:#e65100,color:#fff
```

```mermaid
%% @spec-version v1.3.1
%% Decision Matrix for DataLossCheck: No Risk vs Risk Detected
flowchart TD
    M[Evaluate Data Loss Risk Factors...] --> A{Aggregate Risk Conditions}

    FF[File exists on disk AND will be overwritten] --> A
    C[Code changes detected outside spec scope] --> A
    B[No recent git backup / uncommitted changes] --> A
    V[User confirmation flag not set] --> A

    A -->|"FF == true OR C == true OR B == true OR V == true"| Risk[Risk Detected → Alert User]
    A -->|"FF == false AND C == false AND B == false AND V == false"| NoRisk[No Risk → Proceed to GenerateTests]

    style NoRisk fill:#1b5e20,color:#fff
    style Risk fill:#b71c1c,color:#fff
```
