# Mermaid Diagram Driven Development (MDDD) CLI 🚀

![npm](https://img.shields.io/npm/v/mddd-cli)
![npm](https://img.shields.io/npm/l/mddd-cli)
![Node](https://img.shields.io/node/v/mddd-cli)

---

<p align="center">
  <a href="#português">🇧🇷 Português</a> •
  <a href="#english">🇺🇸 English</a>
</p>

---

<a id="português"></a>

# 🇧🇷 Português

Uma CLI agnóstica, ultra-leve e cirúrgica para implementar **MDDD (Mermaid Diagram Driven Development)** de forma modular, colocalizada e estritamente versionada.

Esta ferramenta automatiza a criação e a conexão de arquivos de especificação visual (Markdown + Mermaid). O objetivo é envelopar as regras de negócio em arquivos `.spec.md` para que qualquer IA de mercado (**Cursor, Windsurf, Claude Code, GitHub Copilot**, etc.) use esses diagramas como a **Fonte Única da Verdade** antes de tocar no código produtivo.

---

## 📌 O Conceito: MDDD

No **Mermaid Diagram Driven Development**, invertemos o ciclo tradicional de desenvolvimento orientado por chat de IA:

1. **Desenho (`/md-new`):** A IA e você criam a regra de negócio visualmente dentro do arquivo colocalizado `.spec.md`.
2. **Aprovação:** Você revisa o fluxo visual direto no preview do Markdown do seu editor de código.
3. **Edição (`/md-edit`):** Ajustes de escopo alteram o diagrama primeiro e incrementam a versão semântica do arquivo.
4. **Implementação (`/md-impl`):** A IA lê a especificação assinada e versionada para escrever o código definitivo e os testes unitários.

---

## ✅ Pré-visualização dos Diagramas Mermaid

### Exemplo diagrama de inicialização de um app Flutter
<img width="1316" height="444" alt="image" src="https://github.com/user-attachments/assets/5cacc283-e517-4468-a8cd-d67442a75bf2" />

### Exemplo de matriz de decisão
<img width="1237" height="702" alt="image" src="https://github.com/user-attachments/assets/e8ffc227-9b2a-44d5-ad66-116dffedc8ba" />

Para visualizar os diagramas Mermaid diretamente no seu editor durante o fluxo MDDD, você pode utilizar extensões que renderizam blocos ````mermaid```` em arquivos Markdown:

### VS Code
- **Markdown Preview Mermaid Support** — Adiciona suporte a diagramas Mermaid no preview nativo do Markdown.
- **Mermaid Editor** — Editor visual com preview lado a lado e exportação.
- **bierner.markdown-mermaid** — Extensão oficial que estende o preview de Markdown para renderizar Mermaid.

### JetBrains (IntelliJ, WebStorm, GoLand, etc.)
- Suporte nativo a Mermaid a partir do **2024.1** — Basta abrir o arquivo `.spec.md` e usar o preview de Markdown integrado.

### Outros Editores
- **Neovim/Vim:** Utilize plugins como `iamcco/markdown-preview.nvim` (com `markdown-preview` configurado para Mermaid).
- **Sublime Text:** Pacote `Mermaid` no Package Control que adiciona preview e snippets.
- **Markdown Editors:** Ferramentas como [Typora](https://typora.io), [Obsidian](https://obsidian.md) e [Notion](https://notion.so) já possuem suporte nativo a Mermaid — basta colar o arquivo `.spec.md` e o diagrama será renderizado automaticamente.

> 💡 **Dica:** Quanto melhor a visualização dos diagramas, mais fácil validar os fluxos de negócio antes de implementar.

---

## 📥 Instalação

Como o pacote está publicado no NPM, a instalação é global e simples:

```bash
# Instalação global
npm install -g mddd-cli
```

> **Nota:** Certifique-se de ter o **Node.js v18 ou superior** instalado em sua máquina.

---

## 🚀 Guia de Uso Rápido

O fluxo MDDD é baseado em comandos de CLI para gerenciar a estrutura e comandos de barra (`/`) para orquestrar a IA no chat.

### 1. Inicialize seu projeto

Na raiz do seu projeto, execute:

```bash
md init
```

Isso criará o arquivo `system_prompt.md` na raiz, contendo as instruções globais que guiarão a IA no entendimento da metodologia MDDD.

### 2. Crie uma nova especificação (Feature)

Ao iniciar uma nova funcionalidade, crie o contrato visual dela:

```bash
# Para uma funcionalidade simples (micro)
md new src/feature-name

# Para um módulo completo (macro)
md new src/feature-name --macro
```

Isso gerará o arquivo `feature-name.spec.md` com a estrutura de Mermaid, Matriz de Decisão e Versionamento.

### 3. Auditoria de Legado

Precisa refatorar um código existente? Audite-o:

```bash
md audit src/path/to/legacy-file.dart
```

---

## 🤖 Comandos de Barra (Gatilhos para IAs)

Após rodar o `md init`, a sua IA passará a entender estes atalhos quando você os digitar no chat:

| Comando     | Descrição                                                                        |
| :---------- | :------------------------------------------------------------------------------- |
| `/md-new`   | Inicia o modo de desenho para nova feature (gera diagrama e tabela).             |
| `/md-edit`  | Solicita alteração em um `.spec.md` existente (incrementa versão semântica).     |
| `/md-audit` | Analisa código legado e propõe refatoração visual (Mermaid).                     |
| `/md-impl`  | Gera código e testes baseando-se estritamente no diagrama do `.spec.md`.         |

---

## 🏗️ Arquitetura de Especificação Colocalizada (Co-location)

As especificações visuais não ficam centralizadas em pastas distantes. Elas vivem no **mesmo diretório** do componente, tela ou feature que descrevem.

```
src/
└── home/
    ├── home.spec.md          # 🌎 MACRO: Visão global do módulo (stateDiagram-v2)
    ├── guest/
    │   ├── guest.spec.md     # 🔬 MICRO: Fluxo de tela (graph LR) + Matriz de Decisão
    │   └── guest_page.dart   # 💻 Código produtivo gerado pela IA
    └── consumer/
        └── consumer.spec.md  # 🔬 MICRO: Fluxo de tela (graph LR) + Matriz de Decisão
```

---

## 📦 Comandos da CLI

| Comando       | Descrição                                                                                             |
| :------------ | :---------------------------------------------------------------------------------------------------- |
| `md init`     | Inicializa o prompt de sistema universal e as skills para guiar qualquer IA no projeto.               |
| `md new`      | Cria uma nova especificação `.spec.md` colocalizada com versionamento automático.                     |
| `md edit`     | Sinaliza uma alteração pendente em um arquivo de especificação existente.                             |
| `md audit`    | Audita um arquivo de código existente para criar uma especificação retroativa ou sugerir refatoração. |
| `md impl`     | Prepara o ecossistema para implementar código produtivo e testes com base no `.spec.md`.              |

---

## 🧪 Tecnologias

- **Node.js** >= 18
- **Commander.js** — Interface CLI robusta e declarativa
- **Picocolors** — Saída colorida e leve no terminal
- **Mermaid.js** — Diagramação visual como fonte da verdade

---

## 💬 Precisa de ajuda?

Se encontrar qualquer problema, abra uma [Issue no GitHub](https://github.com/JulioCRFilho/mermaid-diagram-driven-development/issues).

---

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais informações.

---

---

<a id="english"></a>

# 🇺🇸 English

An agnostic, ultra-lightweight, and surgical CLI for implementing **MDDD (Mermaid Diagram Driven Development)** in a modular, co-located, and strictly versioned way.

This tool automates the creation and connection of visual specification files (Markdown + Mermaid). The goal is to encapsulate business rules within `.spec.md` files so that any AI tool (**Cursor, Windsurf, Claude Code, GitHub Copilot**, etc.) uses these diagrams as the **Single Source of Truth** before touching production code.

---

## 📌 The Concept: MDDD

In **Mermaid Diagram Driven Development**, we invert the traditional AI chat-driven development cycle:

1. **Design (`/md-new`):** The AI and you create the business rule visually inside the co-located `.spec.md` file.
2. **Approval:** You review the visual flow directly in your code editor's Markdown preview.
3. **Editing (`/md-edit`):** Scope adjustments alter the diagram first and increment the file's semantic version.
4. **Implementation (`/md-impl`):** The AI reads the signed and versioned specification to write the definitive code and unit tests.

---

## ✅ Mermaid Diagram Preview

To preview Mermaid diagrams directly in your editor during the MDDD workflow, you can use extensions that render ````mermaid```` blocks in Markdown files:

### Flutter App Initialization Diagram Example
<img width="1316" height="444" alt="image" src="https://github.com/user-attachments/assets/5cacc283-e517-4468-a8cd-d67442a75bf2" />

### Decision Matrix Example
<img width="1237" height="702" alt="image" src="https://github.com/user-attachments/assets/e8ffc227-9b2a-44d5-ad66-116dffedc8ba" />

### VS Code
- **Markdown Preview Mermaid Support** — Adds Mermaid diagram support to the native Markdown preview.
- **Mermaid Editor** — Visual editor with side-by-side preview and export.
- **bierner.markdown-mermaid** — Official extension that extends the Markdown preview to render Mermaid.

### JetBrains (IntelliJ, WebStorm, GoLand, etc.)
- Native Mermaid support starting from **2024.1** — Just open the `.spec.md` file and use the built-in Markdown preview.

### Other Editors
- **Neovim/Vim:** Use plugins like `iamcco/markdown-preview.nvim` (with `markdown-preview` configured for Mermaid).
- **Sublime Text:** `Mermaid` package from Package Control that adds preview and snippets.
- **Markdown Editors:** Tools like [Typora](https://typora.io), [Obsidian](https://obsidian.md), and [Notion](https://notion.so) already have native Mermaid support — just paste the `.spec.md` file and the diagram will render automatically.

> 💡 **Tip:** The better you can visualize the diagrams, the easier it is to validate business flows before implementation.

---

## 📥 Installation

Since the package is published on NPM, installation is global and simple:

```bash
# Global installation
npm install -g mddd-cli
```

> **Note:** Make sure you have **Node.js v18 or higher** installed on your machine.

---

## 🚀 Quick Start Guide

The MDDD workflow is based on CLI commands to manage the structure and slash commands (`/`) to orchestrate the AI in the chat.

### 1. Initialize your project

In your project root, run:

```bash
md init
```

This will create the `system_prompt.md` file in the root directory, containing the global instructions that will guide the AI in understanding the MDDD methodology.

### 2. Create a new specification (Feature)

When starting a new feature, create its visual contract:

```bash
# For a simple feature (micro)
md new src/feature-name

# For a complete module (macro)
md new src/feature-name --macro
```

This will generate the `feature-name.spec.md` file with the Mermaid structure, Decision Matrix, and Versioning.

### 3. Legacy Audit

Need to refactor existing code? Audit it:

```bash
md audit src/path/to/legacy-file.dart
```

---

## 🤖 Slash Commands (AI Triggers)

After running `md init`, your AI will understand these shortcuts when you type them in the chat:

| Command     | Description                                                                           |
| :---------- | :------------------------------------------------------------------------------------ |
| `/md-new`   | Starts design mode for a new feature (generates diagram and table).                   |
| `/md-edit`  | Requests changes to an existing `.spec.md` file (increments semantic version).         |
| `/md-audit` | Analyzes legacy code and proposes visual refactoring (Mermaid).                       |
| `/md-impl`  | Generates code and tests strictly based on the `.spec.md` diagram.                    |

---

## 🏗️ Co-located Specification Architecture

Visual specifications are not centralized in distant folders. They live in the **same directory** as the component, screen, or feature they describe.

```
src/
└── home/
    ├── home.spec.md          # 🌎 MACRO: Global module view (stateDiagram-v2)
    ├── guest/
    │   ├── guest.spec.md     # 🔬 MICRO: Screen flow (graph LR) + Decision Matrix
    │   └── guest_page.dart   # 💻 Production code generated by AI
    └── consumer/
        └── consumer.spec.md  # 🔬 MICRO: Screen flow (graph LR) + Decision Matrix
```

---

## 📦 CLI Commands

| Command       | Description                                                                                            |
| :------------ | :----------------------------------------------------------------------------------------------------- |
| `md init`     | Initializes the universal system prompt and skills to guide any AI in the project.                     |
| `md new`      | Creates a new co-located `.spec.md` specification with automatic versioning.                            |
| `md edit`     | Signals a pending change in an existing specification file.                                            |
| `md audit`    | Audits an existing code file to create a retroactive specification or suggest refactoring.             |
| `md impl`     | Prepares the ecosystem to implement production code and tests based on the `.spec.md`.                 |

---

## 🧪 Technologies

- **Node.js** >= 18
- **Commander.js** — Robust and declarative CLI interface
- **Picocolors** — Colorful and lightweight terminal output
- **Mermaid.js** — Visual diagramming as the source of truth

---

## 💬 Need help?

If you encounter any issues, open a [GitHub Issue](https://github.com/JulioCRFilho/mermaid-diagram-driven-development/issues).

---

## 📄 License

Distributed under the MIT license. See the [LICENSE](LICENSE) file for more information.
