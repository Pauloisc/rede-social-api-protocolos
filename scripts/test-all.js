import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n======================================================`);
    console.log(` Executando ${scriptName}...`);
    console.log(`======================================================\n`);

    const child = spawn(process.execPath, [path.join(__dirname, scriptName)], {
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`O script ${scriptName} finalizou com código de erro: ${code}`));
      }
    });
  });
}

async function main() {
  try {
    await runScript('test-rest.js');
    await runScript('test-graphql.js');
    console.log(`\n🎉 SUCESSO: Todos os testes de REST e GraphQL foram executados com êxito!`);
  } catch (err) {
    console.error(`\n❌ Falha na execução dos testes:`, err.message);
    process.exit(1);
  }
}

main();
