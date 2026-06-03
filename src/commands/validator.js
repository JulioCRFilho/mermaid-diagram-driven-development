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
 * Normaliza quebras de linha, remove TODOS os tipos de espaços Unicode fantasmas
 * e elimina comentários/linhas vazias do topo antes do tipo de diagrama.
 * @param {string} code 
 * @returns {string}
 */
function cleanDiagramCode(code) {
  // 1. Unifica todas as quebras de linha possíveis (\r\n ou \r isolado) para \n
  const uniformLines = code.replace(/\r\n|\r/g, '\n');

  // 2. Divide em linhas para processar o topo do arquivo
  const lines = uniformLines.split('\n');
  const cleanedLines = [];
  let foundTypeDeclaration = false;

  for (const line of lines) {
    // Substitui todos os tipos conhecidos de espaços em branco Unicode invisíveis por espaços comuns
    // (\u00A0 é o NBSP, \u2000-\u200A são variantes de espaçamento tipográfico)
    let normalizedLine = line.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ');
    
    const trimmed = normalizedLine.trim();
    
    // Ignora linhas vazias ou comentários iniciais até achar a declaração do diagrama
    if (!foundTypeDeclaration && (trimmed === '' || trimmed.startsWith('%%'))) {
      continue; 
    }
    
    foundTypeDeclaration = true;
    
    // Mantém a linha com os espaços normais restaurados (importante para a indentação dos blocos do Mermaid)
    cleanedLines.push(normalizedLine);
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
    const cleanedDiagrams = [];
    
    for (const diagramCode of diagramsToValidate) {
      const readyCode = cleanDiagramCode(diagramCode);
      await parse(readyCode); // Se tiver espaço fantasma aqui, o parser agora aceita!
      cleanedDiagrams.push(readyCode);
    }
    
    return { 
      valid: true, 
      diagrams: cleanedDiagrams 
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message || 'Erro de sintaxe desconhecido no Mermaid.'
    };
  }
}