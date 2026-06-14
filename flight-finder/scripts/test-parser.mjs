import { buildFlightsFromTavily, normalizeFlightTiming } from '../src/flightParser.js';

const params = {
  source: 'London',
  destination: 'Paris',
  startDate: '2026-09-15',
  endDate: '2026-09-22',
  currency: 'EUR',
  passengers: '1',
  checkSpecialOffers: true,
};

const toolPayloads = [
  {
    locations: {
      source: { name: 'London', countryCode: 'GB' },
      destination: { name: 'Paris', countryCode: 'FR' },
    },
  },
  {
    countries: {
      GB: { flag: '🇬🇧' },
      FR: { flag: '🇫🇷' },
    },
  },
  {
    results: [
      {
        title: 'British Airways London to Paris',
        content: 'Non-stop flight from £89. Depart 08:15 AM arrive 11:20 AM. Duration 2h 05m.',
        url: 'https://example.com/1',
      },
      {
        title: 'Air France special offer',
        content: 'Direct flight €95 special deal. 09:30 to 12:45, 2h 15m.',
        url: 'https://example.com/2',
      },
      {
        title: 'easyJet cheap flights',
        content: 'From $72 one way. 1 stop. 14:00 departure.',
        url: 'https://example.com/3',
      },
      {
        title: 'KLM Royal Dutch',
        content: 'EUR 110 round trip promo.',
        url: 'https://example.com/4',
      },
      {
        title: 'Ryanair deal',
        content: '£65 sale price nonstop.',
        url: 'https://example.com/5',
      },
    ],
  },
];

const flights = buildFlightsFromTavily(params, toolPayloads);
console.log(`Parsed ${flights.length} flights (expected 5):\n`);
flights.forEach((f, i) => {
  console.log(`${i + 1}. ${f.airline} | ${f.price} ${f.currency}`);
  console.log(`   Depart: ${f.departureTime} | Arrive: ${f.arrivalTime} | Duration: ${f.duration}`);
  console.log(`   Link:   ${f.link}`);
});

const normalized = normalizeFlightTiming(
  { departureTime: 'N/A', arrivalTime: 'N/A', duration: 'N/A' },
  params,
);
console.log('\nDate fallback:', normalized);

if (flights.length !== 5) {
  process.exit(1);
}
