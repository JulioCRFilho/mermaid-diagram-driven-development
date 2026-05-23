#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import pc from 'picocolors';

const program = new Command();

// Busca o macro (*.spec.md) mais próximo subindo recursivamente a árvore de diretórios
function findClosestMacro(currentDir) {
    let dir = currentDir;
    while (dir !== path.parse(dir).root) {
        try {
            const files = fs.readdirSync(dir);
            // Procura por qualquer arquivo .spec.md que esteja acima na árvore
            const macroFile = files.find(f => f.endsWith('.spec.md') && f !== `${path.basename(currentDir)}.spec.md`);
            
            if (macroFile) {
                return path.join(dir, macroFile);
            }
        } catch (e) {
            // Silencia erros de permissão de leitura em pastas do sistema
            break;
        }
        dir = path.dirname(dir);
    }
    return null;
}

program
  .name('md')
  .description('Gerenciador de especificações colocalizadas para Mermaid Diagram Driven Development (MDDD)')
  .version('3.0.0');

// ==========================================
// COMANDO: md init
// ==========================================
program
  .command('init')
  .description('Inicializa o prompt de sistema universal para guiar qualquer IA no projeto sob a metodologia MDDD')
  .action(() => {
    const promptContent = `# Protocolo Mermaid Diagram Driven Development (MDDD)

Você deve seguir estritamente a arquitetura de especificações modulares por feature antes de alterar ou escrever código produtivo.

## 1. Estrutura de Árvore e Co-location
As especificações visuais vivem universalmente em formato Markdown (.md) exatamente no mesmo nível do código que descrevem:
- Módulos/Domínios macros possuem um arquivo \`[nome].spec.md\` contendo o diagrama global (sintaxe stateDiagram-v2).
- Telas ou fluxos de sub-regras micros possuem um arquivo \`[nome].spec.md\` contendo o fluxo da interface (sintaxe graph LR) + Tabelas de Decisão.

## 2. Regra de Conexão Entre Fluxos Existentes
Sempre que você criar ou alterar uma funcionalidade usando um arquivo pai explícito:
1. Abra o arquivo pai indicado ANTES de desenhar o fluxo novo.
2. Localize o nó exato de onde a bifurcação de negócio deve nascer.
3. Modifique o código Mermaid do arquivo PAI para fazer a seta apontar para o novo estado gerado.
4. No arquivo FILHO, inicie o grafo usando um nó de entrada que herde o contexto do pai.

## 3. Regra Estrita de Versionamento de Diagramas
- Todo arquivo possui um cabeçalho de metadados \`\`.
- Sempre que você alterar um diagrama Mermaid ou uma tabela de decisão usando o comando \`/md-edit\`, você DEVE incrementar a versão semântica do arquivo no cabeçalho antes de salvar:
  - Mude o Patch (\`v1.0.0\` -> \`v1.0.1\`) para correções de sintaxe ou pequenos ajustes de texto nos nós.
  - Mude o Minor (\`v1.0.0\` -> \`v1.1.0\`) para novos estados, novas transições ou novas colunas na matriz de decisão.
- Nunca remova a tag de versão. Ela é a garantia de que a implementação de código está alinhada com o design correto.

## 4. Atalhos de Chat (Comandos de Barra)
Você deve monitorar o chat para os seguintes gatilhos. Se a mensagem começar com um deles, execute a ação estritamente como descrito:

- \`/md-new [caminho_da_nova_feature] [--parent caminho/do/pai.spec.md]\`:
  Modo Desenho. Você deve rodar o comando de terminal \`md new [caminho_da_nova_feature]\` (e incluir \`-p [caminho]\` se houver pai). Em seguida, monte o Mermaid e as tabelas dentro do arquivo gerado e pare para aguardar aprovação visual.

- \`/md-edit [arquivo.spec.md] [instrução]\`:
  Modo Edição. Abra o arquivo especificado, aplique a alteração no Mermaid ou tabelas mantendo a sintaxe 100% válida e incremente o cabeçalho \`\`.

- \`/md-impl [caminho_da_feature]\`:
  Modo Implementação. Leia o arquivo \`.spec.md\` do caminho como sua única Fonte da Verdade e escreva o código produtivo e testes equivalentes.
`;

    fs.writeFileSync('system_prompt.md', promptContent);
    console.log(pc.green('✅ Arquivo universal [system_prompt.md] gerado na raiz do projeto!'));
    console.log(pc.cyan('💡 Qualquer IA (Cursor, Windsurf, Claude Code, etc.) agora lerá estas regras nativamente.'));
  });

// ==========================================
// COMANDO: md new <targetPath>
// ==========================================
program
  .command('new')
  .description('Cria uma nova especificação colocalizada em Markdown, injeta versionamento e vincula ao fluxo pai')
  .argument('<targetPath>', 'Caminho do diretório da feature (ex: src/home/guest)')
  .option('-m, --macro', 'Define se o novo arquivo será um macro de módulo contendo stateDiagram-v2')
  .option('-p, --parent <parentFile>', 'Caminho de um arquivo spec (.spec.md) existente para conectar este novo fluxo')
  .action((targetPath, options) => {
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }

    const folderName = path.basename(targetPath);
    const isMacro = options.macro;
    
    // Extensão universal .spec.md para absolutamente tudo
    const finalFile = path.join(targetPath, `${folderName}.spec.md`);

    if (fs.existsSync(finalFile)) {
        console.log(pc.yellow(`⚠️  A especificação já existe em: ${finalFile}`));
        return;
    }

    // Geração dos templates envelopados com a tag de versão global no topo
    let template = '';
    if (isMacro) {
        template = `\n# Macro Módulo: ${folderName}\n\n\`\`\`mermaid\n%% @spec-version v1.0.0\nstateDiagram-v2\n    title Macro Módulo: ${folderName} (v1.0.0)\n\n    [*] --> Inicial_${folderName}\n    \n    state Inicial_${folderName} {\n        [*] --> Pronto\n    }\n\`\`\`\n`;
    } else {
        template = `\n# Especificação: ${folderName}\n\n## 1. Fluxo de Tela (UI/UX)\n\`\`\`mermaid\n%% @spec-version v1.0.0\ngraph LR\n    A([Início]) --> B[Ação do Usuário]\n\`\`\`\n\n## 2. Matriz de Decisão\n| Condição | Ação | Próximo Estado |\n| :--- | :--- | :--- |\n`;
    }

    fs.writeFileSync(finalFile, template);
    console.log(pc.green(`✅ Novo arquivo Markdown criado com controle de versão (v1.0.0): ${finalFile}`));

    // Lógica de Vinculação entre os arquivos Markdown
    let macroPath = null;
    if (options.parent) {
        if (fs.existsSync(options.parent)) {
            macroPath = options.parent;
            console.log(pc.cyan('🎯 Usando o arquivo pai explícito enviado por parâmetro.'));
        } else {
            console.log(pc.red(`❌ O arquivo pai indicado não foi encontrado: ${options.parent}`));
            process.exit(1);
        }
    } else if (!isMacro) {
        macroPath = findClosestMacro(targetPath);
    }

    if (macroPath) {
        const relativePath = path.relative(path.dirname(macroPath), finalFile);
        const cleanLinkPath = relativePath.replace(/\\/g, '/'); // Normaliza barras para padrão POSIX/Web
        
        // Como o pai é um arquivo Markdown, injetamos uma seção de navegação limpa no fim do documento
        const injection = `\n\n%% Conexão automática para sub-fluxo\n- [Ir para as regras de ${folderName}](file://./${cleanLinkPath})\n`;

        fs.appendFileSync(macroPath, injection);
        console.log(pc.blue(`🔗 Vinculado com sucesso no arquivo pai: ${macroPath}`));
    } else if (!isMacro) {
        console.log(pc.yellow('⚠️  Aviso: Nenhum arquivo macro (*.spec.md) acima na árvore foi encontrado para auto-vinculação.'));
    }
  });

program.parse(process.argv);