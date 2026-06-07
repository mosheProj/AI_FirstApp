export function formatOffersList(offers, params) {
  const lines = [
    '',
    '═'.repeat(60),
    '  PREMIUM TRAVEL OFFERS (sorted by price, highest first)',
    '═'.repeat(60),
    `  Location:  ${params.location}`,
    `  Dates:     ${params.startDate} → ${params.endDate}`,
    `  Adults:    ${params.adults}`,
    '═'.repeat(60),
    '',
  ];

  offers.forEach((offer, i) => {
    lines.push(
      `${i + 1}. ${offer.hotel}`,
      `   Room:     ${offer.roomType}`,
      `   Price:    ${
        offer.price > 0
          ? `${offer.currency ?? 'USD'} ${offer.price.toLocaleString()}`
          : 'See link (live price on site)'
      }`,
      `   Source:   ${offer.source}`,
      `   Link:     ${offer.link}`,
      '',
    );
  });

  lines.push(`Showing ${offers.length} offer(s).\n`);
  return lines.join('\n');
}
