import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { MAX_INPUT_LENGTH, validateInput } from './prompts.js';

async function ask(rl, label) {
  console.log(`\n${label} (max ${MAX_INPUT_LENGTH} characters)`);
  while (true) {
    const answer = (await rl.question('> ')).trim();
    try {
      return validateInput(answer, label);
    } catch (error) {
      console.log(`  ${error.message}`);
    }
  }
}

export async function collectSearchParams() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log('\n✈️  Travel Deals Agent\n');
    console.log('Enter your trip details to search travel websites.\n');

    const location = await ask(rl, 'Location');
    const startDate = await ask(rl, 'Start date');
    const endDate = await ask(rl, 'End date');
    const adults = await ask(rl, 'Number of adults');

    console.log('\n--- Trip summary ---');
    console.log(`  Location:   ${location}`);
    console.log(`  Start:      ${startDate}`);
    console.log(`  End:        ${endDate}`);
    console.log(`  Adults:     ${adults}`);

    const confirm = (await rl.question('\nSearch travel sites now? [Y/n] '))
      .trim()
      .toLowerCase();
    if (confirm === 'n' || confirm === 'no') {
      console.log('\nCancelled.\n');
      process.exit(0);
    }

    return { location, startDate, endDate, adults };
  } finally {
    rl.close();
  }
}
