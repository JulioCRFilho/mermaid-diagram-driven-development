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

** DIRETRIZ DE ESCRITA DE ESPECIFICAÇÃO: **
Sempre use Mermaid para descrever fluxos de negócio, arquitetura ou estados de máquina. Evite ao máximo o uso de texto corrido ou listas para descrever lógicas complexas.
As especificações (.spec.md) devem ser documentos vivos focados no Contrato Atual, não em auditorias passadas.

Se o arquivo for o Contrato da Feature: Foque apenas no:
    - Diagrama Mermaid (Fluxo real).
    - Matriz de Decisão (Regras de negócio).
    - Assinatura das interfaces/serviços (API contract).
    - Versionamento: Mantenha o SPEC_VERSION sempre no topo.

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
        // Garante que o diretório base exista
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        // Correção: Extrai o nome da feature para o arquivo
        // Se targetPath terminar em /routing, folderName será 'routing'.
        // O arquivo será 'routing.spec.md'.
        const folderName = path.basename(targetPath);
        const finalFile = path.join(targetPath, `${folderName}.spec.md`);

        // Segurança: Verifica se o caminho final existe e é um diretório
        if (fs.existsSync(finalFile) && fs.lstatSync(finalFile).isDirectory()) {
            console.log(pc.red(`❌ Erro: Já existe um diretório com o nome ${finalFile}. Não é possível criar o arquivo spec.`));
            process.exit(1);
        }

        if (fs.existsSync(finalFile)) {
            console.log(pc.yellow(`⚠️  A especificação já existe em: ${finalFile}`));
            return;
        }

        const isMacro = options.macro;
        const version = 'v1.0.0';
        let template = isMacro
            ? `\n# Macro Módulo: ${folderName} | ${version}\n\n` +
            `\`\`\`mermaid\n%% @spec-version ${version}\nstateDiagram-v2\n    [*] --> Inicial_${folderName}\n\`\`\`\n\n` +
            `## 3. Histórico de Auditoria\n<details>\n<summary>Clique para expandir</summary>\n\n\n\n</details>\n`
            : `\n# Especificação: ${folderName} | ${version}\n\n` +
            `## 1. Contrato de Fluxo (Mermaid)\n\`\`\`mermaid\n%% @spec-version ${version}\ngraph LR\n    A([Início]) --> B[Processo]\n\`\`\`\n\n` +
            `## 2. Matriz de Decisão\n| Condição | Ação | Próximo Estado |\n| :--- | :--- | :--- |\n| | | |\n\n` +
            `## 3. Histórico de Auditoria\n<details>\n<summary>Clique para expandir</summary>\n\n\n\n</details>\n`;

        fs.writeFileSync(finalFile, template);
        console.log(pc.green(`✅ Novo arquivo Markdown criado: ${finalFile}`));

        // Lógica de Vinculação
        let macroPath = options.parent || (!isMacro ? findClosestMacro(targetPath) : null);

        if (macroPath) {
            if (!fs.existsSync(macroPath)) {
                console.log(pc.red(`❌ Arquivo pai não encontrado: ${macroPath}`));
                process.exit(1);
            }
            const relativePath = path.relative(path.dirname(macroPath), finalFile);
            const cleanLinkPath = relativePath.replace(/\\/g, '/');
            const injection = `\n\n%% Conexão automática para sub-fluxo\n- [Ir para as regras de ${folderName}](file://./${cleanLinkPath})\n`;

            fs.appendFileSync(macroPath, injection);
            console.log(pc.blue(`🔗 Vinculado com sucesso no arquivo pai: ${macroPath}`));
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