# Travel Deals Agent

LangChain agent that searches travel websites for hotel offers using OpenRouter and live page reads (Google Travel + Booking.com).

## Setup

```bash
cd travel-agent
npm install
copy .env.example .env
```

Add your OpenRouter API key (same key as story-agent works):

```
OPENROUTER_API_KEY=sk-or-v1-...
```

## Run

### Interactive mode

```bash
npm start
```

### One-shot mode

```bash
npm run travel -- --location "Paris" --start "2026-06-10" --end "2026-06-15" --adults "2"
```

From repo root:

```bash
npm run travel
```

## Inputs (max 50 characters each)

| Field | Example |
|-------|---------|
| Location | `Paris` |
| Start date | `2026-06-10` |
| End date | `2026-06-15` |
| Adults | `2` |

## Output

Up to **10 offers**, each with:

- Hotel name
- Room type
- Price (sorted **descending** — highest first)
- Link to offer
- Source website

## How it works

1. **System prompt** — instructs the agent to search and extract offers
2. **Tool** `search_travel_sites` — reads Google Travel and Booking.com listing pages for the trip
3. **Agent** — `createAgent({ model, tools, responseFormat })` with structured Zod output
4. Results sorted by price descending before display
5. **Fallback** — if the model returns empty offers, parsed hotels from the tool are still shown

## Tips

- Use a clear city/region name (e.g. `Eilat` or `Israel south`).
- Dates like `06/17/2026` are converted automatically to `2026-06-17`.
- Run `npm start` (not `npm start travel`).
- First search may take 30–60 seconds (loads travel sites).

For production, integrate official travel APIs (Amadeus, Skyscanner, etc.).

## Environment

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key |
