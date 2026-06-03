import { parse } from '@mermaid-js/parser';
import fs from 'node:fs';

function extractMermaidBlocks(text) {
  const regex = /```mermaid\s*([\s\S]*?)\s*```/g;
  const blocks = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match[1].trim()) {
      blocks.push(match[1].trim());
    }
  }
  
  return blocks;
}

/**
 * Limpa comentários do topo do diagrama que quebram o parser do Mermaid
 * @param {string} code 
 * @returns {string}
 */
function cleanDiagramCode(code) {
  // Remove linhas que começam com %% no topo do arquivo antes da declaração do tipo
  const lines = code.split('\n');
  const cleanedLines = [];
  let foundTypeDeclaration = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Ignora linhas vazias ou comentários iniciais até achar a declaração do diagrama
    if (!foundTypeDeclaration && (trimmed === '' || trimmed.startsWith('%%'))) {
      continue; 
    }
    
    foundTypeDeclaration = true;
    cleanedLines.push(line);
  }

  return cleanedLines.join('\n').trim();
}

export async function validateMermaidSyntax(input) {
  let content = input;

  if (fs.existsSync(input)) {
    content = fs.readFileSync(input, 'utf-8');
  }

  let diagramsToValidate = [content];
  if (content.includes('```mermaid')) {
    diagramsToValidate = extractMermaidBlocks(content);
    
    if (diagramsToValidate.length === 0) {
      return {
        valid: false,
        error: "Nenhum bloco de código '```mermaid' estruturado foi encontrado."
      };
    }
  }

  try {
    for (const diagramCode of diagramsToValidate) {
      // Aplica a limpeza antes de mandar para o parser em memória
      const readyCode = cleanDiagramCode(diagramCode);
      await parse(readyCode);
    }
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error.message || 'Erro de sintaxe desconhecido no Mermaid.'
    };
  }
}