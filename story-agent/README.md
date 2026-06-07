# Children's Story Agent

A LangChain agent powered by OpenRouter that writes customizable children's stories.

## Setup

```bash
cd story-agent
npm install
copy .env.example .env
```

Add your OpenRouter API key to `.env`:

```
OPENROUTER_API_KEY=sk-or-v1-...
```

## Run

### Interactive mode (recommended)

The agent asks you for all parameters, then writes the story:

```bash
cd story-agent
npm start
```

Or:

```bash
npm run story
```

**Important:** Do **not** run `npm start story` — npm passes the word `story` as an argument and skips the questions. Use `npm start` only (no extra word).

You will be asked for:
1. Story subject (max 50 characters)
2. Story type — happy or scary
3. Ending — good or bad
4. Length — short (5 sentences) or long (7 sentences)

### One-shot mode (command-line flags)

```bash
npm run story -- "a brave little rabbit"
npm run story -- "a haunted treehouse" --scary --bad-end --long
```

From the repo root:

```bash
npm run story
```

## Story options

| Option | Flags | Default |
|--------|-------|---------|
| **Story type** | `--happy`, `--scary` | `happy` |
| **Ending** | `--good-end`, `--bad-end` | `good` |
| **Length** | `--short` (5 sentences), `--long` (7 sentences) | `short` |

## Constraints

| | Limit |
|---|---|
| **Input** (story subject) | 50 characters max |
| **Short output** | 5 sentences max |
| **Long output** | 7 sentences max |

## HTTP API

Start the API server:

```bash
cd story-agent
npm run server
```

Default URL: `http://127.0.0.1:3000` (override with `PORT` and `HOST` env vars).

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | API info and valid options |
| `GET` | `/health` | Health check |
| `POST` | `/api/story` | Generate a story |

### `POST /api/story`

**Request body (JSON):**

```json
{
  "subject": "a brave little rabbit",
  "storyType": "happy",
  "ending": "good",
  "length": "short"
}
```

| Field | Required | Values | Default |
|-------|----------|--------|---------|
| `subject` | yes | max 50 characters | — |
| `storyType` | no | `happy`, `scary` | `happy` |
| `ending` | no | `good`, `bad` | `good` |
| `length` | no | `short`, `long` | `short` |

**Response (200):**

```json
{
  "subject": "a brave little rabbit",
  "options": { "storyType": "happy", "ending": "good", "length": "short" },
  "story": "Once upon a time..."
}
```

**Example (PowerShell — Windows):**

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:3000/api/story -Method POST `
  -ContentType "application/json" `
  -Body '{"subject":"a haunted treehouse","storyType":"scary","ending":"bad","length":"long"}'
```

**Example (curl — Git Bash / macOS / Linux):**

```bash
curl -X POST http://127.0.0.1:3000/api/story \
  -H "Content-Type: application/json" \
  -d '{"subject":"a haunted treehouse","storyType":"scary","ending":"bad","length":"long"}'
```

**Easiest test (any OS):** with the server running in another terminal:

```bash
cd story-agent
npm run test:api
```

From the repo root:

```bash
npm run story:server
```

## Architecture

- **Interactive prompts** — `src/interactive.js` collects user input
- **System prompt** — built dynamically from story type, ending, and length (`src/prompts.js`)
- **User prompt** — built from subject and selected options
- **Agent** — `createAgent({ model, tools })` with `ChatOpenRouter` in `src/agent.js`
- **CLI** — `src/cli.js` — interactive when run with no arguments
- **API server** — `src/server.js` — exposes `writeStory` over HTTP

## Environment

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `PORT` | API server port (default `3000`) |
| `HOST` | API server host (default `127.0.0.1`) |
