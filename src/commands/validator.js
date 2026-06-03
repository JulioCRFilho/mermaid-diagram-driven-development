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
 * Normaliza os espaços invisíveis, quebras de linha e remove comentários iniciais
 * @param {string} code 
 * @returns {string}
 */
function cleanDiagramCode(code) {
  // 1. Substitui espaços não-quebráveis (NBSP) por espaços normais
  // 2. Remove possíveis retornos de carro (\r) de arquivos gerados no Windows
  const normalizedCode = code
    .replace(/\u00A0/g, ' ')
    .replace(/\r/g, '');

  const lines = normalizedCode.split('\n');
  const cleanedLines = [];
  let foundTypeDeclaration = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Ignora linhas vazias ou comentários iniciais até achar a declaração do tipo de diagrama
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