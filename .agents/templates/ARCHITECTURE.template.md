<!--
  ⚠️  TEMPLATE FILE — strict structure. The `mddd-context-map` skill must
  populate EVERY section below, leaving no `{{PLACEHOLDER}}` unsubstituted.
  Each section uses Mermaid diagrams and decision matrices instead of
  free-form prose, so the LLM has minimal text to interpret.
-->

# {{PROJECT_NAME}} — Context Map

**Stats:** {{MACRO_COUNT}} MACRO · {{MICRO_COUNT}} MICRO · {{EXTERNAL_COUNT}} external · {{INFRA_COUNT}} infra nodes

---

## 1. Topology Overview (flowchart LR)

The one-glance picture. Every domain is a subgraph; actors and externals live outside.

```mermaid
flowchart LR
    %% === ACTORS (outside subgraphs) ===
    {{ACTORS}}

    %% === EXTERNAL SYSTEMS (outside subgraphs) ===
    {{EXTERNALS}}

    %% === MACRO DOMAINS ===
    {{MACRO_SUBGRAPHS}}

    %% === INFRASTRUCTURE LAYER (deduplicated) ===
    {{INFRA_SUBGRAPH}}

    %% === EDGES ===
    {{EDGES}}

    %% === CLASSES ===
    classDef userNode     fill:#fef3c7,stroke:#b45309,stroke-width:2px,color:#1f2937;
    classDef systemNode   fill:#1e3a8a,stroke:#1e40af,stroke-width:2px,color:#fff;
    classDef externalNode fill:#7c2d12,stroke:#9a3412,stroke-width:2px,color:#fff;
    classDef infraNode    fill:#374151,stroke:#4b5563,stroke-width:1px,color:#fff,font-style:italic;
    {{CLASS_ASSIGNMENTS}}
```

---

## 2. MACRO Decision Matrices

For each MACRO domain, emit the **Primitive Factors** that drive its decision matrix (truth-table form, no prose). One table per MACRO. Reproduce the factor columns found in the MACRO's `*.spec.md`.

### 2.1 {{MACRO_1_NAME}}

| {{MACRO_1_FACTOR_COLUMNS}} | Proposed Action | Decision | Transition State |
| :--- | :--- | :---: | :--- |
| {{MACRO_1_MATRIX_ROWS}} |

### 2.2 {{MACRO_2_NAME}}

| {{MACRO_2_FACTOR_COLUMNS}} | Proposed Action | Decision | Transition State |
| :--- | :--- | :---: | :--- |
| {{MACRO_2_MATRIX_ROWS}} |

*(Add one 2.x section per additional MACRO.)*

---

## 3. Cross-Domain Data Flow Diagrams

One **sequence diagram** per main data flow (auth, CRUD, payment, deploy, etc.). No prose.

### 3.1 {{FLOW_1_NAME}} — Sequence

```mermaid
sequenceDiagram
    {{FLOW_1_PARTICIPANTS}}
    {{FLOW_1_MESSAGES}}
```

### 3.2 {{FLOW_2_NAME}} — Sequence

```mermaid
sequenceDiagram
    {{FLOW_2_PARTICIPANTS}}
    {{FLOW_2_MESSAGES}}
```

### 3.3 {{FLOW_3_NAME}} — Sequence

```mermaid
sequenceDiagram
    {{FLOW_3_PARTICIPANTS}}
    {{FLOW_3_MESSAGES}}
```

*(Add one 3.x section per major flow.)*

---

## 4. External Integrations (graph LR)

A focused diagram of every third-party system and how each one is reached.

```mermaid
graph LR
    {{INTEGRATION_NODES}}
    {{INTEGRATION_EDGES}}
    classDef externalNode fill:#7c2d12,stroke:#9a3412,stroke-width:2px,color:#fff;
    classDef systemNode   fill:#1e3a8a,stroke:#1e40af,stroke-width:2px,color:#fff;
    {{INTEGRATION_CLASS_ASSIGNMENTS}}
```

---

## 5. Infrastructure Topology (graph TB)

The infrastructure layer as a stand-alone top-down diagram.

```mermaid
graph TB
    {{INFRA_NODES}}
    {{INFRA_EDGES}}
    classDef infraNode fill:#374151,stroke:#4b5563,stroke-width:1px,color:#fff,font-style:italic;
    classDef systemNode   fill:#1e3a8a,stroke:#1e40af,stroke-width:2px,color:#fff;
    {{INFRA_CLASS_ASSIGNMENTS}}
```

---

## 6. Component Dependency Matrix

Compact truth-table of every inter-component edge found in the project. One row per edge. No free text.

| From | To | Edge Label | Trigger | Source Spec |
| :--- | :--- | :--- | :--- | :--- |
| {{MATRIX_ROWS}} |

---

## 7. Generation Footer

```
Generated: {{GENERATION_DATE}}
MDDD Framework: v1.0.0 — stable
Methodology: mddd-context-map skill v{{SKILL_VERSION}}
Project: {{PROJECT_NAME}}
Total MACRO: {{MACRO_COUNT}} · Total MICRO: {{MICRO_COUNT}} · External: {{EXTERNAL_COUNT}} · Infra: {{INFRA_COUNT}}
Validation: ✅ npx md validate ARCHITECTURE.spec.md
```

---

## Strict Substitution Rules

The skill **MUST** populate every section above. If a section does not apply to the project, write a single Mermaid block showing `(empty — no X found)` instead of removing the section. The template is **rigid** — do not reorder sections, do not merge sections, do not add free-form prose outside the labeled slots. Use diagrams and tables to express everything.
