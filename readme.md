# Mermaid Diagram Driven Development (MDDD) CLI 🚀

![npm](https://img.shields.io/npm/v/mddd-cli)
![npm](https://img.shields.io/npm/l/mddd-cli)
![Node](https://img.shields.io/node/v/mddd-cli)

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