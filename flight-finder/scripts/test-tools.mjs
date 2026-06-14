import '../src/env.js';
import { geocodeLocations } from '../src/services/geocoding.js';
import { lookupCountries } from '../src/services/countries.js';
import { applyTargetCurrencyToFlights, convertPrices } from '../src/services/currency.js';

async function main() {
  console.log('Testing geocode_locations...');
  const locations = await geocodeLocations('London', 'Paris');
  console.log(JSON.stringify(locations, null, 2));

  const codes = [locations.source.countryCode, locations.destination.countryCode];
  console.log('\nTesting lookup_countries...');
  const countries = await lookupCountries(codes);
  console.log(JSON.stringify(countries, null, 2));

  console.log('\nTesting convert_flight_prices...');
  const converted = await convertPrices(
    [
      { amount: 120, currency: 'GBP' },
      { amount: 95, currency: 'EUR' },
      { amount: 110, currency: 'USD' },
    ],
    'USD',
  );
  console.log(JSON.stringify(converted, null, 2));

  console.log('\nTesting applyTargetCurrencyToFlights (GBP/USD -> EUR)...');
  const flights = await applyTargetCurrencyToFlights(
    [
      { price: 89, currency: 'GBP', airline: 'BA' },
      { price: 95, currency: 'EUR', airline: 'AF' },
      { price: 72, currency: 'USD', airline: 'U2' },
    ],
    'EUR',
  );
  console.log(flights);
  if (flights.some((f) => f.currency !== 'EUR')) {
    throw new Error('Not all flights converted to EUR');
  }

  console.log('\nAll service smoke tests passed.');
}

main().catch((error) => {
  console.error(`\nSmoke test failed: ${error.message}\n`);
  process.exit(1);
});
