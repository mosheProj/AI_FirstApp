import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { buildNorthwindQuery, closeAgentResources } from './northwind-agent.js';

function printUsage() {
  console.log(`
Northwind Expert DBA Agent
==========================

Build PostgreSQL SELECT queries from simple-language Northwind requests.

Usage:
  npm run agent -- "get all customers"
  npm run agent -- "show orders with customer company names"
  npm run agent -- -i

Options:
  -h, --help         Show help
  -i, --interactive  Ask for a request interactively
`);
}

function parseArgs(argv) {
  const args = argv.filter((arg) => arg !== '--');
  let help = false;
  let interactive = false;
  const questionParts = [];

  for (const arg of args) {
    if (arg === '-h' || arg === '--help') {
      help = true;
    } else if (arg === '-i' || arg === '--interactive') {
      interactive = true;
    } else {
      questionParts.push(arg);
    }
  }

  return {
    help,
    interactive,
    question: questionParts.join(' ').trim(),
  };
}

async function promptForQuestion() {
  const rl = readline.createInterface({ input, output });
  try {
    return (await rl.question('Northwind request: ')).trim();
  } finally {
    rl.close();
  }
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.help) {
    printUsage();
    return;
  }

  const question = parsed.interactive || !parsed.question
    ? await promptForQuestion()
    : parsed.question;

  const sqlQuery = await buildNorthwindQuery(question);
  console.log(sqlQuery);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeAgentResources();
  });
