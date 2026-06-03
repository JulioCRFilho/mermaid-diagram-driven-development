import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

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
        error: "Nenhum bloco '```mermaid' encontrado no arquivo."
      };
    }
  }

  const tempInputPath = path.join(process.cwd(), `.temp_validate_${Date.now()}.mmd`);
  const tempOutputPath = path.join(process.cwd(), `.temp_validate_${Date.now()}.svg`);

  try {
    const validatedDiagrams = [];

    for (const diagramCode of diagramsToValidate) {
      fs.writeFileSync(tempInputPath, diagramCode, 'utf-8');

      // AJUSTE AQUI: Explicitamos o pacote (-p) e chamamos o executável real (mmdc)
      await execAsync(`npx -p @mermaid-js/mermaid-cli mmdc -i "${tempInputPath}" -o "${tempOutputPath}"`);

      if (fs.existsSync(tempOutputPath)) {
        fs.unlinkSync(tempOutputPath);
      }
      
      validatedDiagrams.push(diagramCode);
    }

    if (fs.existsSync(tempInputPath)) {
      fs.unlinkSync(tempInputPath);
    }

    return { 
      valid: true, 
      diagrams: validatedDiagrams 
    };

  } catch (error) {
    if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
    if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);

    // Captura o erro real de compilação enviado pelo compilador do Mermaid
    const errorMessage = error.stderr || error.message || 'Erro de validação desconhecido no Mermaid.';

    return {
      valid: false,
      error: errorMessage.trim()
    };
  }
}