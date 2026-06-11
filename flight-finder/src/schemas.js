import * as z from 'zod';

export const MAX_INPUT_LENGTH = 80;

const trimmedString = (label) =>
  z
    .string({ required_error: `${label} is required.` })
    .trim()
    .min(1, `${label} cannot be empty.`)
    .max(MAX_INPUT_LENGTH, `${label} must be at most ${MAX_INPUT_LENGTH} characters.`);

export const SearchParamsSchema = z.object({
  source: trimmedString('Source'),
  destination: trimmedString('Destination'),
  startDate: trimmedString('Start date'),
  endDate: trimmedString('End date'),
  currency: z
    .string({ required_error: 'Currency is required.' })
    .trim()
    .min(1, 'Currency cannot be empty.')
    .max(8, 'Currency must be at most 8 characters.')
    .transform((v) => v.toUpperCase()),
  passengers: trimmedString('Passengers'),
  checkSpecialOffers: z.boolean().optional().default(true),
});

export function normalizeSearchParamsInput(params = {}) {
  const checkSpecialOffers = parseCheckSpecialOffers(params.checkSpecialOffers);

  return {
    source: params.source,
    destination: params.destination,
    startDate: params.startDate ?? params.departureDate ?? params.departure ?? params.start,
    endDate: params.endDate ?? params.returnDate ?? params.return ?? params.end,
    currency: params.currency,
    passengers: params.passengers,
    checkSpecialOffers,
  };
}

function parseCheckSpecialOffers(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0'].includes(normalized)) return false;
  throw new Error('checkSpecialOffers must be true or false.');
}

export function validateSearchParams(params = {}) {
  const normalized = normalizeSearchParamsInput(params);
  const result = SearchParamsSchema.safeParse(normalized);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(' ');
    throw new Error(message);
  }

  return result.data;
}

export const FlightOfferSchema = z.object({
  source: z.string().describe('Source city or airport name'),
  sourceFlag: z.string().describe('Source country flag emoji'),
  destination: z.string().describe('Destination city or airport name'),
  destinationFlag: z.string().describe('Destination country flag emoji'),
  airline: z.string().describe('Airline company name'),
  stops: z.number().int().min(0).describe('Number of stops; 0 means nonstop'),
  price: z.number().describe('Price as a number in the target currency'),
  currency: z.string().describe('Currency code, e.g. USD, EUR'),
  currencySymbol: z.string().describe('Currency symbol, e.g. $, €'),
  departureTime: z
    .string()
    .describe('Departure date/time; use trip Start date if no specific time is available'),
  arrivalTime: z
    .string()
    .describe('Arrival date/time; use trip End date (or Start date for one-way) if no specific time'),
  duration: z.string().describe('Flight duration e.g. 2h 35m, or "—" if unknown'),
  link: z.string().describe('URL to the booking or listing page from tavily_search'),
  isSpecialOffer: z.boolean().optional().describe('True if this is a special offer'),
});

export const FlightsResponseSchema = z.object({
  flights: z
    .array(FlightOfferSchema)
    .min(1)
    .max(5)
    .describe('Exactly 5 cheapest flight offers when possible, sorted by price ascending'),
});
