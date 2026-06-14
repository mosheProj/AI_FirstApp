import { formatPrice } from './services/currency.js';

export function formatFlightsList(flights, params) {
  const tripType = params.startDate === params.endDate ? 'one-way' : 'round-trip';
  const lines = [
    '',
    '═'.repeat(62),
    '  CHEAPEST FLIGHT OFFERS (sorted by price, lowest first)',
    '═'.repeat(62),
    `  Route:       ${params.source} → ${params.destination}`,
    `  Start date:  ${params.startDate}`,
    `  End date:    ${params.endDate}`,
    `  Passengers:  ${params.passengers}`,
    `  Currency:    ${params.currency}`,
    `  Trip:        ${tripType}`,
    `  Special offers: ${params.checkSpecialOffers ? 'yes' : 'no'}`,
    '═'.repeat(62),
    '',
  ];

  flights.forEach((flight, i) => {
    const priceLabel =
      flight.price > 0
        ? formatPrice(flight.price, flight.currency)
        : 'See search results';

    lines.push(
      `${i + 1}. ${flight.source} ${flight.sourceFlag} → ${flight.destination} ${flight.destinationFlag}`,
      `   Airline:   ${flight.airline}`,
      `   Stops:     ${flight.stops}`,
      `   Price:     ${priceLabel}`,
      `   Depart:    ${flight.departureTime}`,
      `   Arrive:    ${flight.arrivalTime}`,
      `   Duration:  ${flight.duration}`,
      `   Link:      ${flight.link || 'N/A'}`,
    );

    if (flight.isSpecialOffer) {
      lines.push('   Offer:     Special offer');
    }

    lines.push('');
  });

  lines.push(`Showing ${flights.length} flight(s).\n`);
  return lines.join('\n');
}
