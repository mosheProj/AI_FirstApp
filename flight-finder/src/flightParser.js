import { getCurrencySymbol } from './services/currency.js';
import { MAX_FLIGHTS } from './prompts.js';

const AIRLINE_PATTERNS = [
  /\b(British Airways|Air France|Lufthansa|KLM|Ryanair|easyJet|Emirates|Qatar Airways|Turkish Airlines|United Airlines|American Airlines|Delta Air Lines|Southwest Airlines|JetBlue|Alaska Airlines|Iberia|Vueling|Norwegian|Finnair|SAS|Swiss International|Austrian Airlines|El Al|Wizz Air|Vueling|ITA Airways|TAP Air Portugal|Aegean Airlines)\b/i,
];

const PRICE_PATTERNS = [
  /(?:from\s+)?([€$£])\s*([\d,]+(?:\.\d{2})?)/i,
  /([\d,]+(?:\.\d{2})?)\s*(USD|EUR|GBP|ILS|CHF|CAD|AUD)\b/i,
  /\b(USD|EUR|GBP)\s*([\d,]+(?:\.\d{2})?)/i,
];

const TIME_PATTERN = /\b(\d{1,2}:\d{2})\s*(AM|PM|am|pm)?\b/g;
const DURATION_PATTERN =
  /\b(\d{1,2})\s*h(?:ours?)?(?:\s*(\d{1,2})\s*m(?:in(?:utes?)?)?)?|\b(\d{1,2})\s*h(?:ours?)?\s*(\d{1,2})\s*m\b/i;
const STOPS_PATTERN = /\b(non[- ]?stop|direct)\b|(\d+)\s*stop/i;

function extractPrice(text) {
  for (const pattern of PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;

    if (match[1] && ['$', '€', '£'].includes(match[1])) {
      const symbolMap = { $: 'USD', '€': 'EUR', '£': 'GBP' };
      return {
        amount: parseFloat(match[2].replace(/,/g, '')),
        currency: symbolMap[match[1]],
      };
    }

    const amount = parseFloat((match[2] ?? match[1]).replace(/,/g, ''));
    const currency = (match[1] ?? match[2]).toString().toUpperCase();
    if (Number.isFinite(amount)) {
      return { amount, currency: /^[A-Z]{3}$/.test(currency) ? currency : 'USD' };
    }
  }
  return { amount: 0, currency: '' };
}

function extractAirline(text, title = '') {
  const combined = `${title} ${text}`;
  for (const pattern of AIRLINE_PATTERNS) {
    const match = combined.match(pattern);
    if (match) return match[1];
  }

  const fromMatch = combined.match(/\b(?:on|with|via)\s+([A-Z][A-Za-z\s&]+?)(?:\s+flight|\s+from|,|\.|$)/);
  if (fromMatch) return fromMatch[1].trim();

  return 'See listing';
}

function extractTimes(text) {
  const times = [];
  let match;
  const regex = new RegExp(TIME_PATTERN.source, TIME_PATTERN.flags);
  while ((match = regex.exec(text)) !== null) {
    times.push(match[2] ? `${match[1]} ${match[2].toUpperCase()}` : match[1]);
  }
  return times;
}

function extractDuration(text) {
  const match = text.match(DURATION_PATTERN);
  if (!match) return '';

  const hours = match[1] ?? match[3];
  const minutes = match[2] ?? match[4] ?? '0';
  if (!hours) return '';
  return minutes && minutes !== '0' ? `${hours}h ${minutes}m` : `${hours}h`;
}

function extractStops(text) {
  const match = text.match(STOPS_PATTERN);
  if (!match) return 0;
  if (match[1]) return 0;
  return parseInt(match[2], 10) || 0;
}

function formatDateTime(date, time) {
  if (!time || time === 'N/A') return date;
  if (time.includes(date)) return time;
  return `${date} ${time}`;
}

export function normalizeFlightTiming(flight, params) {
  const departDate = params.startDate;
  const arriveDate = params.startDate;

  const normalized = { ...flight };

  if (!normalized.departureTime || normalized.departureTime === 'N/A') {
    normalized.departureTime = departDate;
  } else if (!normalized.departureTime.includes(departDate)) {
    normalized.departureTime = formatDateTime(departDate, normalized.departureTime);
  }

  if (!normalized.arrivalTime || normalized.arrivalTime === 'N/A') {
    normalized.arrivalTime = arriveDate;
  } else if (!normalized.arrivalTime.includes(arriveDate)) {
    normalized.arrivalTime = formatDateTime(arriveDate, normalized.arrivalTime);
  }

  if (!normalized.duration || normalized.duration === 'N/A') {
    normalized.duration = '—';
  }

  return normalized;
}

export function parseTavilyResult(result, context, params) {
  const text = `${result.title ?? ''} ${result.content ?? ''}`;
  const price = extractPrice(text);
  const times = extractTimes(text);
  const airline = extractAirline(text, result.title ?? '');

  return normalizeFlightTiming(
    {
      source: context.sourceName,
      sourceFlag: context.sourceFlag,
      destination: context.destName,
      destinationFlag: context.destFlag,
      airline,
      stops: extractStops(text),
      price: price.amount,
      currency: price.currency || params.currency,
      currencySymbol: getCurrencySymbol(price.currency || params.currency),
      departureTime: times[0] ?? '',
      arrivalTime: times[1] ?? '',
      duration: extractDuration(text),
      isSpecialOffer: /special|deal|sale|promo|offer|discount/i.test(text),
      link: result.url ?? '',
      _sourceUrl: result.url ?? '',
      _snippet: (result.content ?? '').slice(0, 300),
    },
    params,
  );
}

export function buildFlightsFromTavily(params, toolPayloads) {
  const geocode = toolPayloads.find((p) => p.locations)?.locations;
  const countries = toolPayloads.find((p) => p.countries)?.countries ?? {};
  const tavily = [...toolPayloads].reverse().find((p) => p.results?.length);

  const sourceCode = geocode?.source?.countryCode ?? '';
  const destCode = geocode?.destination?.countryCode ?? '';
  const context = {
    sourceName: geocode?.source?.name ?? params.source,
    destName: geocode?.destination?.name ?? params.destination,
    sourceFlag: countries[sourceCode]?.flag ?? '',
    destFlag: countries[destCode]?.flag ?? '',
  };

  const results = tavily?.results ?? [];
  return results.slice(0, MAX_FLIGHTS).map((result) => parseTavilyResult(result, context, params));
}

function isBetterOffer(candidate, existing) {
  if ((candidate.price ?? 0) > 0 && (existing.price ?? 0) === 0) return true;
  if (candidate.airline !== 'See listing' && existing.airline === 'See listing') return true;
  if (candidate.departureTime && candidate.departureTime !== existing.departureTime) return true;
  return false;
}

export function mergeFlights(tavilyFlights, llmFlights, params) {
  const merged = [];

  for (let i = 0; i < MAX_FLIGHTS; i += 1) {
    const fromTavily = tavilyFlights[i];
    const fromLlm = llmFlights[i];

    if (!fromTavily && !fromLlm) continue;

    let flight = fromTavily ? { ...fromTavily } : { ...fromLlm };

    if (fromTavily && fromLlm) {
      flight = { ...fromTavily };
      for (const [key, value] of Object.entries(fromLlm)) {
        if (value === undefined || value === null || value === '' || value === 'N/A') continue;
        if (key === 'price' && value === 0) continue;
        if (key === 'link' && fromTavily.link) continue;
        if (isBetterOffer({ ...fromLlm, [key]: value }, flight)) {
          flight[key] = value;
        } else if (key === 'price' && value > 0) {
          flight[key] = value;
        } else if (flight[key] === 'See listing' || flight[key] === '—' || !flight[key]) {
          flight[key] = value;
        }
      }
    }

    merged.push(normalizeFlightTiming(flight, params));
  }

  return merged;
}

export function ensureFlightCount(flights, params, toolPayloads) {
  let result = flights.filter(Boolean);

  if (result.length < MAX_FLIGHTS) {
    const tavilyFlights = buildFlightsFromTavily(params, toolPayloads);
    const existingUrls = new Set(result.map((f) => f._sourceUrl).filter(Boolean));

    for (const candidate of tavilyFlights) {
      if (result.length >= MAX_FLIGHTS) break;
      if (candidate._sourceUrl && existingUrls.has(candidate._sourceUrl)) continue;
      result.push(candidate);
      if (candidate._sourceUrl) existingUrls.add(candidate._sourceUrl);
    }
  }

  return result.slice(0, MAX_FLIGHTS).map((f) => normalizeFlightTiming(f, params));
}
