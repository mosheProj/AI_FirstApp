import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { MAX_INPUT_LENGTH, validateSearchParams } from './schemas.js';

async function ask(rl, label) {
  console.log(`\n${label} (max ${MAX_INPUT_LENGTH} characters)`);
  while (true) {
    const answer = (await rl.question('> ')).trim();
    if (answer) return answer;
    console.log(`  ${label} is required.`);
  }
}

async function askCheckSpecialOffers(rl) {
  console.log('\nCheck for special offers? (optional, default: yes) [Y/n]');
  const answer = (await rl.question('> ')).trim().toLowerCase();
  if (!answer || answer === 'y' || answer === 'yes') return true;
  if (answer === 'n' || answer === 'no') return false;
  console.log('  Please enter y or n.');
  return askCheckSpecialOffers(rl);
}

export async function collectSearchParams() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log('\n✈️  Flight Finder Agent\n');
    console.log('Enter your trip details to search for the cheapest flights.\n');

    const raw = {
      source: await ask(rl, 'Source'),
      destination: await ask(rl, 'Destination'),
      startDate: await ask(rl, 'Start date'),
      endDate: await ask(rl, 'End date'),
      currency: await ask(rl, 'Currency'),
      passengers: await ask(rl, 'Passengers'),
      checkSpecialOffers: await askCheckSpecialOffers(rl),
    };

    const params = validateSearchParams(raw);

    console.log('\n--- Trip summary ---');
    console.log(`  Source:             ${params.source}`);
    console.log(`  Destination:        ${params.destination}`);
    console.log(`  Start date:         ${params.startDate}`);
    console.log(`  End date:           ${params.endDate}`);
    console.log(`  Currency:           ${params.currency}`);
    console.log(`  Passengers:         ${params.passengers}`);
    console.log(`  Special offers:     ${params.checkSpecialOffers ? 'yes' : 'no'}`);

    const confirm = (await rl.question('\nSearch flights now? [Y/n] ')).trim().toLowerCase();
    if (confirm === 'n' || confirm === 'no') {
      console.log('\nCancelled.\n');
      process.exit(0);
    }

    return params;
  } finally {
    rl.close();
  }
}
