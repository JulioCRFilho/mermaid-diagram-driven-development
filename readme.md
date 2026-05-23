# Mermaid Diagram Driven Development (MDDD) CLI 🚀

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

## 📥 Instalação

Como o pacote está publicado no NPM, a instalação é global e simples:

```bash
# Instalação global
npm install -g mddd-cli
Nota: Certifique-se de ter o Node.js v18 ou superior instalado em sua máquina.

🚀 Guia de Uso Rápido
O fluxo MDDD é baseado em comandos de CLI para gerenciar a estrutura e comandos de barra (/) para orquestrar a IA no chat.

1. Inicialize seu projeto
Na raiz do seu projeto, execute: md init
Isso criará o arquivo system_prompt.md na raiz, contendo as instruções globais que guiarão a IA no entendimento da metodologia MDDD.

2. Crie uma nova especificação (Feature)
Ao iniciar uma nova funcionalidade, crie o contrato visual dela: 
# Para uma funcionalidade simples (micro) 
md new src/feature-name

# Para um módulo completo (macro)
md new src/feature-name --macro

Isso gerará o arquivo feature-name.spec.md com a estrutura de Mermaid, Matriz de Decisão e Versionamento.

3. Auditoria de Legado
Precisa refatorar um código existente? Audite-o: 
md audit src/path/to/legacy-file.dart

🤖 Comandos de Barra (Gatilhos para IAs)
Após rodar o md init, a sua IA passará a entender estes atalhos quando você os digitar no chat:
Comando Descrição
/md-new Inicia o modo de desenho para nova feature (gera diagrama e tabela).
/md-edit Solicita alteração em um .spec.md existente (incrementa versão semântica).
/md-audit Analisa código legado e propõe refatoração visual (Mermaid).
/md-impl Gera código e testes baseando-se estritamente no diagrama do .spec.md.

🏗️ Arquitetura de Especificação Colocalizada (Co-location)
As especificações visuais não ficam centralizadas em pastas distantes. Elas vivem no mesmo diretório do componente, tela ou feature que descrevem.

src/
└── home/
    ├── home.spec.md          # 🌎 MACRO: Visão global do módulo (stateDiagram-v2)
    ├── guest/
    │   ├── guest.spec.md     # 🔬 MICRO: Fluxo de tela (graph LR) + Matriz de Decisão
    │   └── guest_page.dart   # 💻 Código produtivo gerado pela IA
    └── consumer/
        └── consumer.spec.md  # 🔬 MICRO: Fluxo de tela (graph LR) + Matriz de Decisão

💬 Precisa de ajuda?
Se encontrar qualquer problema, abra uma Issue no GitHub.