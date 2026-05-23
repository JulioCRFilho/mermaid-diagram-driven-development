# Mermaid Diagram Driven Development (MDDD) CLI 🚀

Uma CLI agnóstica, ultra-leve e cirúrgica para implementar **MDDD (Mermaid Diagram Driven Development)** de forma modular, colocalizada e estritamente versionada.

Esta ferramenta automatiza a criação e a conexão de arquivos de especificação visual (Markdown + Mermaid). O objetivo é envelopar as regras de negócio em arquivos `.spec.md` para que qualquer IA de mercado (**Cursor, Windsurf, Claude Code, GitHub Copilot**, etc.) use esses diagramas como a **Fonte Única da Verdade** antes de tocar no código produtivo.

---

## 📌 O Conceito: MDDD

No **Mermaid Diagram Driven Development**, invertemos o ciclo tradicional de desenvolvimento orientado por chat de IA:

1. **Desenho (`/md-new`):** A IA ou você criam a regra de negócio visualmente dentro do arquivo colocalizado `.spec.md`.
2. **Aprovação:** Você revisa o fluxo visual direto no preview do Markdown do seu editor de código.
3. **Edição (`/md-edit`):** Ajustes de escopo alteram o diagrama primeiro e incrementam a versão semântica do arquivo.
4. **Implementação (`/md-impl`):** A IA lê a especificação assinada e versionada para escrever o código definitivo e os testes unitários.

---

## 🏗️ Arquitetura de Especificação Colocalizada (Co-location)

As especificações visuais não ficam centralizadas em pastas distantes. Elas vivem no mesmo diretório do componente, tela ou feature que descrevem.

```text
src/
└── home/
    ├── home.spec.md          # 🌎 MACRO: Visão global do módulo (stateDiagram-v2)
    ├── guest/
    │   ├── guest.spec.md     # 🔬 MICRO: Fluxo de tela (graph LR) + Matriz de Decisão
    │   └── guest_page.dart   # 💻 Código produtivo gerado pela IA
    └── consumer/
        └── consumer.spec.md  # 🔬 MICRO: Fluxo de tela (graph LR) + Matriz de Decisão