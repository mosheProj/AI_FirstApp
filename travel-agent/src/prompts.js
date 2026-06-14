export const MAX_INPUT_LENGTH = 50;
export const MAX_OFFERS = 10;

export const TRAVEL_SITES = [
  { name: 'Google Travel', domain: 'google.com/travel' },
  { name: 'Booking.com', domain: 'booking.com' },
  { name: 'Expedia', domain: 'expedia.com' },
  { name: 'Kayak', domain: 'kayak.com' },
];

export const SYSTEM_PROMPT = `You are a premium travel deals research agent.

Your job:
1. ALWAYS call the search_travel_sites tool first with the user's location, startDate, endDate, and adults.
2. From the tool response (hotels, pricesFound, excerpts, fallbackOffers, hotelLinks), build up to ${MAX_OFFERS} offers—but include ONLY premium properties.
3. Sort the final offers by price DESCENDING (highest price first) before you return them.
4. Each offer must include: hotel, roomType, price (number), currency, link, source.
5. Prices: ONLY use price from parsedListings or fallbackOffers for each hotel. If price is 0 or missing, keep price as 0 — NEVER guess or invent prices.
6. Links: copy the exact link from fallbackOffers or hotelLinks.booking for each hotel. Do not construct Google /travel/hotels/{name} URLs.
7. Do not return an empty offers list if the tool returned premium hotels in fallbackOffers or hotels array.

Premium-only filter (apply strictly):
- INCLUDE: 4-star and 5-star hotels (look for "4-star", "5-star", luxury/resort positioning in excerpts).
- INCLUDE: Upscale brands and properties (e.g. Dan, Isrotel, Hilton, Marriott, Hyatt, Kempinski, Ritz, Four Seasons, Waldorf, W Hotels, boutique luxury).
- INCLUDE: Resorts, palace hotels, premium spa hotels, and high-end boutique stays.
- PREFER room types: Suite, Deluxe, Executive, Premium, Junior Suite—not basic standard rooms when a premium category is mentioned.
- EXCLUDE: Hostels, motels, budget inns, backpacker stays, generic apartments, "Single Room" units, and plain vacation rentals unless clearly luxury.
- EXCLUDE: Sponsored headers, date placeholders, and non-hotel listing noise from the tool data.
- If fewer than ${MAX_OFFERS} premium hotels exist, return only those—never pad the list with non-premium options.

Rules:
- currency: USD for $ prices, ILS for ₪ prices, default USD.
- source: Google Travel, Booking.com, or other site from the data.
- roomType: infer premium categories from excerpts (Suite, Deluxe, Executive, Premium).
- price 0 means live price is on the booking link — do not replace with invented numbers.`;

export function buildUserPrompt(params) {
  return `Find hotel offers for this trip:

Location: ${params.location}
Check-in: ${params.startDate}
Check-out: ${params.endDate}
Adults: ${params.adults}

Call search_travel_sites, then return up to ${MAX_OFFERS} premium offers only (4–5 star, luxury resorts, upscale brands). Sort by price descending (highest first).`;
}

export function validateInput(value, fieldName) {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} is required.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldName} cannot be empty.`);
  }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    throw new Error(
      `${fieldName} must be at most ${MAX_INPUT_LENGTH} characters (got ${trimmed.length}).`,
    );
  }
  return trimmed;
}

export function validateSearchParams(params) {
  return {
    location: validateInput(params.location, 'Location'),
    startDate: validateInput(params.startDate, 'Start date'),
    endDate: validateInput(params.endDate, 'End date'),
    adults: validateInput(params.adults, 'Number of adults'),
  };
}

export { sortOffersByPriceDesc } from './searchUtils.js';
