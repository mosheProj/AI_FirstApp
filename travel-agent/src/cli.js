import { findTravelOffers } from './agent.js';
import { formatOffersList } from './formatOffers.js';
import { collectSearchParams } from './interactive.js';
import { validateSearchParams } from './prompts.js';

function printUsage() {
  console.log(`
Travel Deals Agent
==================

Interactive mode:
  npm start
  npm run travel

One-shot mode:
  npm run travel -- --location "Paris" --start "2026-06-10" --end "2026-06-15" --adults "2"

Options:
  --location   Destination (max 50 chars)
  --start      Check-in date (max 50 chars)
  --end        Check-out date (max 50 chars)
  --adults     Number of adults (max 50 chars)

Output:
  Up to 10 offers (hotel, room, price, link) sorted by price descending.

Setup:
  cd travel-agent
  npm install
  copy .env.example .env
  # Set OPENROUTER_API_KEY in .env
`);
}

function parseArgs(argv) {
  const params = {};
  let help = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') help = true;
    else if (arg === '--location' && argv[i + 1]) {
      params.location = argv[++i];
    } else if (arg === '--start' && argv[i + 1]) {
      params.startDate = argv[++i];
    } else if (arg === '--end' && argv[i + 1]) {
      params.endDate = argv[++i];
    } else if (arg === '--adults' && argv[i + 1]) {
      params.adults = argv[++i];
    }
  }

  return { help, params };
}

function hasAllParams(params) {
  return params.location && params.startDate && params.endDate && params.adults;
}

function isTravelMistake(argv) {
  return argv.length === 1 && argv[0].toLowerCase() === 'travel';
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  let searchParams;

  const parsed = parseArgs(argv);
  const useInteractive =
    isTravelMistake(argv) || (!hasAllParams(parsed.params) && !parsed.params.location);

  if (isTravelMistake(argv)) {
    console.log('\nTip: Use "npm start" not "npm start travel". Starting interactive mode.\n');
  }

  if (useInteractive) {
    searchParams = await collectSearchParams();
  } else if (!hasAllParams(parsed.params)) {
    printUsage();
    process.exit(1);
  } else {
    searchParams = validateSearchParams(parsed.params);
  }

  try {
    console.log('\nSearching travel websites (this may take a minute)...\n');
    const { offers, params } = await findTravelOffers(searchParams);
    console.log(formatOffersList(offers, params));
  } catch (error) {
    console.error(`\nError: ${error.message}\n`);
    process.exit(1);
  }
}

main();
