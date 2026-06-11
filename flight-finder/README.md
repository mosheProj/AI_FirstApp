# Flight Finder Agent

A LangChain + OpenRouter agent that searches the web for the **cheapest flight prices** and special offers. Built for **flight search only** — it will not handle hotels or other travel tasks.

## Features

- **Tavily** web search for up to 5 lowest flight prices and deals
- **Open-Meteo Geocoding** for source/destination coordinates (one tool call)
- **REST Countries** for country names and flag emojis (one API call)
- **Frankfurter** currency conversion (one API call for all prices)
- CLI with interactive and one-shot modes

## Setup

```bash
cd flight-finder
npm install
copy .env.example .env
```

Edit `.env` and set:

```
OPENROUTER_API_KEY=sk-or-v1-your-key
TAVILY_API_KEY=tvly-your-key
```

## Usage

### Interactive mode

```bash
npm start
# or
npm run flight
```

### One-shot mode

```bash
npm run flight -- --source "London" --destination "Paris" --start "2026-09-15" --end "2026-09-22" --currency "EUR" --passengers "2"
```

| Flag | Description | Required |
|------|-------------|----------|
| `--source` | Departure city or airport | yes |
| `--destination` | Arrival city or airport | yes |
| `--start` | Start date | yes |
| `--end` | End date | yes |
| `--currency` | Target currency code | yes |
| `--passengers` | Number of passengers | yes |
| `--special-offers` | Check for special offers (`true`/`false`) | no (default: `true`) |

## Output

Up to 5 flights sorted by price (cheapest first), each showing:

- Source + flag emoji
- Destination + flag emoji
- Airline
- Number of stops
- Price with currency symbol
- Departure time
- Arrival time
- Duration
- Link to purchase / booking site
- Special offer indicator (when applicable)

## Tools

| Tool | API | Purpose |
|------|-----|---------|
| `geocode_locations` | Open-Meteo | Resolve both cities in one call |
| `lookup_countries` | restcountries.com/v3.1 | Flags and country names |
| `tavily_search` | Tavily | Web search for flight prices |
| `convert_flight_prices` | Frankfurter | Convert all prices to target currency |

## Smoke test (no LLM cost)

```bash
npm run test:tools
```

Tests geocoding, country lookup, and currency conversion helpers.

## Limitations

- Prices and schedules come from live web search results via Tavily and may vary by site and date.
- The agent extracts data from search snippets; always verify on the airline or booking site before purchasing.
