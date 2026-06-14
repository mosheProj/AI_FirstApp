import { findFlights } from './agent.js';
import { formatFlightsList } from './formatFlights.js';
import { collectSearchParams } from './interactive.js';
import { validateSearchParams } from './schemas.js';

function printUsage() {
  console.log(`
Flight Finder Agent
===================

Interactive mode:
  npm start
  npm run flight

One-shot mode:
  npm run flight -- --source "London" --destination "Paris" --start "2026-09-15" --end "2026-09-22" --currency "EUR" --passengers "2"

Options (all required except --special-offers):
  --source           Departure city or airport
  --destination      Arrival city or airport
  --start            Start date
  --end              End date
  --currency         Target currency code
  --passengers       Number of passengers
  --special-offers   Check for special offers: true/false (optional, default: true)

Output:
  Up to 5 cheapest flights with flags, airline, stops, price, times, duration, and link.

Setup:
  cd flight-finder
  npm install
  copy .env.example .env
  # Set OPENROUTER_API_KEY and TAVILY_API_KEY in .env
`);
}

function parseArgs(argv) {
  const params = {};
  let help = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') help = true;
    else if (arg === '--source' && argv[i + 1]) params.source = argv[++i];
    else if (arg === '--destination' && argv[i + 1]) params.destination = argv[++i];
    else if ((arg === '--start' || arg === '--departure') && argv[i + 1]) params.startDate = argv[++i];
    else if ((arg === '--end' || arg === '--return') && argv[i + 1]) params.endDate = argv[++i];
    else if (arg === '--currency' && argv[i + 1]) params.currency = argv[++i];
    else if (arg === '--passengers' && argv[i + 1]) params.passengers = argv[++i];
    else if (arg === '--special-offers' && argv[i + 1]) params.checkSpecialOffers = argv[++i];
  }

  return { help, params };
}

function hasRequiredParams(params) {
  return (
    params.source &&
    params.destination &&
    params.startDate &&
    params.endDate &&
    params.currency &&
    params.passengers
  );
}

function isFlightMistake(argv) {
  return argv.length === 1 && argv[0].toLowerCase() === 'flight';
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
    isFlightMistake(argv) || (!hasRequiredParams(parsed.params) && !parsed.params.source);

  if (isFlightMistake(argv)) {
    console.log('\nTip: Use "npm start" not "npm start flight". Starting interactive mode.\n');
  }

  if (useInteractive) {
    searchParams = await collectSearchParams();
  } else if (!hasRequiredParams(parsed.params)) {
    printUsage();
    process.exit(1);
  } else {
    searchParams = validateSearchParams(parsed.params);
  }

  try {
    console.log('\nSearching for flights (this may take a minute)...\n');
    const { flights, params } = await findFlights(searchParams);
    console.log(formatFlightsList(flights, params));
  } catch (error) {
    console.error(`\nError: ${error.message}\n`);
    process.exit(1);
  }
}

main();
