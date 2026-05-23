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
        const agentsDir = '.agents';
        const skillsDir = path.join(agentsDir, 'skills');

        // 1. Cria a estrutura de pastas
        if (!fs.existsSync(agentsDir)) fs.mkdirSync(agentsDir);
        if (!fs.existsSync(skillsDir)) fs.mkdirSync(skillsDir);

        const promptContent = `# Protocolo Mermaid Diagram Driven Development (MDDD)

Você deve seguir estritamente a arquitetura de especificações modulares por feature antes de alterar, escrever ou auditar código produtivo.

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

- \`/md-audit [caminho_do_arquivo_de_codigo]\`:
  Modo Auditoria Drástica de Legado. Analise o arquivo de código existente sob a ótica de legibilidade visual (MDDD):
  1. Se o código for modular, coeso e limpo: Execute o comando de terminal \`md new [diretorio_do_arquivo]\`. Em seguida, mapeie o fluxo atual no Mermaid, preencha as tabelas de decisão e defina a versão inicial estável como \`\`.
  2. Se o código for caótico, acoplado ou complexo: VOCÊ ESTÁ PROIBIDO de criar um diagrama estável. Em vez disso, aponte os problemas arquiteturais, sugira uma proposta de REFATORAÇÃO separando as responsabilidades e monte o Mermaid de como o fluxo DEVERIA SER pós-refatoração. Salve este arquivo spec com o status de rascunho: \`\`.

- \`/md-impl [caminho_da_feature]\`:
  Modo Implementação. Leia o arquivo \`.spec.md\` do caminho como sua única Fonte da Verdade e escreva o código produtivo e testes equivalentes.

** DIRETRIZ DE ESCRITA DE ESPECIFICAÇÃO: **
As especificações (.spec.md) devem ser documentos vivos focados no Contrato Atual, não em auditorias passadas.

Se o arquivo for uma auditoria: Mantenha a seção de "Problemas Identificados", mas coloque-a no fim, sob uma tag <details> (para que fique colapsada no Markdown).

Se o arquivo for o Contrato da Feature: Foque apenas no:

Diagrama Mermaid (Fluxo real).

Matriz de Decisão (Regras de negócio).

Assinatura das interfaces/serviços (API contract).

Versionamento: Mantenha o SPEC_VERSION sempre no topo.

** REGRAS: **
1. Ao gerar diagramas a partir do código, sempre escape ou remova parênteses de nomes de funções. Use aspas duplas (ex: A["main()"]) se o nome da função precisar ser preservado, ou simplifique o texto do nó (ex: A[main]) para manter o diagrama limpo e evitar erros de renderização.
2. PROIBIDO Arte ASCII ou desenhos manuais.
2. Todo diagrama deve ser encapsulado em blocos de código markdown com a linguagem 'mermaid'.
3. Para fluxos de arquitetura ou lógica de negócio, use exclusivamente 'graph TD' ou 'graph LR'.
4. Para estados de máquina (finitos), use 'stateDiagram-v2'.
5. Nomeie os nós, use formas específicas ([...], ([...]), { ... }) para indicar intenção (Ação, Início/Fim, Decisão).
  `;

        fs.writeFileSync('system_prompt.md', promptContent);

        // 3. Definição das Skills
        const skills = {
            'md-new': "Modo Desenho. Você deve rodar o comando de terminal \`md new [caminho_da_nova_feature]\` (e incluir \`-p [caminho]\` se houver pai). Em seguida, monte o Mermaid e as tabelas dentro do arquivo gerado e pare para aguardar aprovação visual.",
            'md-edit': "Modo Edição. Abra o arquivo especificado, aplique a alteração no Mermaid ou tabelas mantendo a sintaxe 100% válida e incremente o cabeçalho \`\`.",
            'md-audit': "Modo Auditoria Drástica de Legado. Analise o arquivo de código existente sob a ótica de legibilidade visual (MDDD):\n1. Se o código for modular, coeso e limpo: Execute o comando de terminal \`md new [diretorio_do_arquivo]\`. Em seguida, mapeie o fluxo atual no Mermaid, preencha as tabelas de decisão e defina a versão inicial estável como \`\`.\n2. Se o código for caótico, acoplado ou complexo: VOCÊ ESTÁ PROIBIDO de criar um diagrama estável. Em vez disso, aponte os problemas arquiteturais, sugira uma proposta de REFATORAÇÃO separando as responsabilidades e monte o Mermaid de como o fluxo DEVERIA SER pós-refatoração. Salve este arquivo spec com o status de rascunho: \`\`.",
            'md-impl': "Modo Implementação. Leia o arquivo \`.spec.md\` do caminho como sua única Fonte da Verdade e escreva o código produtivo e testes equivalentes."
        };

        Object.keys(skills).forEach(skillName => {
            // 1. Cria a pasta da skill: .agents/skills/md-new/
            const skillFolder = path.join(skillsDir, skillName);
            if (!fs.existsSync(skillFolder)) {
                fs.mkdirSync(skillFolder);
            }

            // 2. Cria o arquivo SKILL.md dentro dela: .agents/skills/md-new/SKILL.md
            const skillFile = path.join(skillFolder, 'SKILL.md');

            if (!fs.existsSync(skillFile)) {
                // Adicionando um título automático para ficar mais organizado
                const content = `# ${skillName.toUpperCase()}\n\n${skills[skillName]}`;
                fs.writeFileSync(skillFile, content);
                console.log(pc.green(`✅ Skill encapsulada: ${skillFile}`));
            }
        });

        console.log(pc.green('✅ Arquivo universal [system_prompt.md] gerado na raiz do projeto!'));
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

        // Geração dos templates otimizados para Cline/MDDD
        let template = '';
        const version = 'v1.0.0';

        if (isMacro) {
            template = `\n# Macro Módulo: ${folderName} | ${version}\n\n` +
                `\`\`\`mermaid\n%% @spec-version ${version}\nstateDiagram-v2\n    [*] --> Inicial_${folderName}\n\`\`\`\n\n` +
                `## 3. Histórico de Auditoria\n<details>\n<summary>Clique para expandir</summary>\n\n\n\n</details>\n`;
        } else {
            template = `\n# Especificação: ${folderName} | ${version}\n\n` +
                `## 1. Contrato de Fluxo (Mermaid)\n\`\`\`mermaid\n%% @spec-version ${version}\ngraph LR\n    A([Início]) --> B[Processo]\n\`\`\`\n\n` +
                `## 2. Matriz de Decisão\n| Condição | Ação | Próximo Estado |\n| :--- | :--- | :--- |\n| | | |\n\n` +
                `## 3. Histórico de Auditoria\n<details>\n<summary>Clique para expandir</summary>\n\n\n\n</details>\n`;
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

// ==========================================
// COMANDO: md edit <specFilePath> <instruction>
// ==========================================
program
    .command('edit')
    .description('Sinaliza uma alteração pendente em um arquivo de especificação Mermaid existente')
    .argument('<specFilePath>', 'Caminho do arquivo spec (.spec.md)')
    .argument('<instruction...>', 'A instrução de alteração ou ajuste de fluxo')
    .action((specFilePath, instruction) => {
        if (!fs.existsSync(specFilePath)) {
            console.log(pc.red(`❌ Arquivo de especificação não encontrado: ${specFilePath}`));
            process.exit(1);
        }

        const fullInstruction = instruction.join(' ');
        console.log(pc.cyan(`📝 Solicitando alteração no fluxo: "${specFilePath}"`));
        console.log(pc.yellow(`⚙️  Instrução avaliada: ${fullInstruction}`));
        console.log(pc.green(`\n🚀 Pronto! Use o atalho /md-edit no chat para a IA aplicar as alterações e incrementar a versão.`));
    });

// ==========================================
// COMANDO: md audit <codeFilePath>
// ==========================================
program
    .command('audit')
    .description('Audita um arquivo de código existente para criar uma especificação retroativa ou sugerir refatoração')
    .argument('<codeFilePath>', 'Caminho do arquivo de código existente (ex: src/services/user.go)')
    .action((codeFilePath) => {
        if (!fs.existsSync(codeFilePath)) {
            console.log(pc.red(`❌ Arquivo de código não encontrado: ${codeFilePath}`));
            process.exit(1);
        }

        const targetDir = path.dirname(codeFilePath);
        const fileName = path.basename(codeFilePath);

        console.log(pc.cyan(`🔍 Auditando estrutura de código para acoplamento em: ${fileName}...`));
        console.log(pc.yellow(`⚡ Solicitando que a IA valide a complexidade antes de gerar a especificação MDDD.`));

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        console.log(pc.green(`\n🚀 Pronto! Use o atalho /md-audit no chat para receber a análise ou o diagrama de refatoração.`));
    });

// ==========================================
// COMANDO: md impl <specFilePath>
// ==========================================
program
    .command('impl')
    .description('Prepara o ecossistema para implementar código produtivo e testes com base no arquivo spec')
    .argument('<specFilePath>', 'Caminho do arquivo de especificação (.spec.md)')
    .action((specFilePath) => {
        if (!fs.existsSync(specFilePath)) {
            console.log(pc.red(`❌ Arquivo de especificação não encontrado: ${specFilePath}`));
            process.exit(1);
        }

        const fileName = path.basename(specFilePath);
        console.log(pc.cyan(`🛠️  Lendo o blueprint de negócio a partir de: ${fileName}...`));
        console.log(pc.yellow(`🎯 Estabelecendo o diagrama assinado como Fonte Única da Verdade.`));
        console.log(pc.green(`\n🚀 Pronto! Use o atalho /md-impl no chat para a IA iniciar a geração do código produtivo e dos testes.`));
    });

program.parse(process.argv);