import './env.js';
import { TavilySearch } from '@langchain/tavily';
import { tool } from 'langchain';
import * as z from 'zod';
import { convertPrices } from './services/currency.js';
import { lookupCountries } from './services/countries.js';
import { geocodeLocations } from './services/geocoding.js';

function getTavilyApiKey() {
  const key = process.env.TAVILY_API_KEY?.trim();
  if (!key) {
    throw new Error(
      'TAVILY_API_KEY is not set in flight-finder/.env\n' + 'Add: TAVILY_API_KEY=tvly-your-key',
    );
  }
  if (key === 'your_tavily_api_key_here') {
    throw new Error(
      'TAVILY_API_KEY is still the placeholder. Edit flight-finder/.env and save.',
    );
  }
  return key;
}

getTavilyApiKey();

export const tavilySearch = new TavilySearch({
  maxResults: 5,
  searchDepth: 'advanced',
  topic: 'general',
});

const GeocodeSchema = z.object({
  source: z.string().describe('Source city or airport name'),
  destination: z.string().describe('Destination city or airport name'),
});

export const geocodeLocationsTool = tool(
  async ({ source, destination }) => {
    try {
      const locations = await geocodeLocations(source, destination);
      return JSON.stringify({ success: true, locations }, null, 2);
    } catch (error) {
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: 'geocode_locations',
    description:
      'Resolve source and destination coordinates and country codes in one call using Open-Meteo geocoding.',
    schema: GeocodeSchema,
  },
);

const CountriesSchema = z.object({
  countryCodes: z
    .array(z.string())
    .min(1)
    .describe('ISO 3166-1 alpha-2 country codes, e.g. ["GB", "FR"]'),
});

export const lookupCountriesTool = tool(
  async ({ countryCodes }) => {
    try {
      const result = await lookupCountries(countryCodes);
      return JSON.stringify({ success: true, ...result }, null, 2);
    } catch (error) {
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: 'lookup_countries',
    description:
      'Fetch country names and flag emojis for source and destination in one REST Countries API call.',
    schema: CountriesSchema,
  },
);

const ConvertPricesSchema = z.object({
  prices: z
    .array(
      z.object({
        amount: z.number().describe('Price amount'),
        currency: z.string().describe('Original currency code'),
      }),
    )
    .min(1)
    .describe('List of flight prices to convert'),
  targetCurrency: z.string().describe('Target currency code, e.g. USD, EUR'),
});

export const convertFlightPricesTool = tool(
  async ({ prices, targetCurrency }) => {
    try {
      const result = await convertPrices(prices, targetCurrency);
      return JSON.stringify({ success: true, ...result }, null, 2);
    } catch (error) {
      return JSON.stringify({ success: false, error: error.message });
    }
  },
  {
    name: 'convert_flight_prices',
    description:
      'Convert all flight prices to the user target currency in one Frankfurter API call.',
    schema: ConvertPricesSchema,
  },
);

export const tools = [
  geocodeLocationsTool,
  lookupCountriesTool,
  tavilySearch,
  convertFlightPricesTool,
];
