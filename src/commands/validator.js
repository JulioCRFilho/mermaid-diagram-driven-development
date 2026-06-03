import { parse } from '@mermaid-js/parser';
import fs from 'node:fs';

/**
 * Filtra o texto para extrair apenas o que está dentro dos blocos ```mermaid
 */
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
 * Valida o conteúdo recebido (pode ser o caminho de um arquivo ou a string direta)
 */
export async function validateMermaidSyntax(input) {
  let content = input;

  // Se o input for um caminho de arquivo válido no disco, lê o conteúdo dele
  if (fs.existsSync(input)) {
    content = fs.readFileSync(input, 'utf-8');
  }

  // Se houver blocos de Markdown indicando Mermaid, isola os diagramas
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

  // Valida cada bloco na memória usando o parser oficial
  try {
    for (const diagramCode of diagramsToValidate) {
      await parse(diagramCode);
    }
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error.message || 'Erro de sintaxe desconhecido no Mermaid.'
    };
  }
}