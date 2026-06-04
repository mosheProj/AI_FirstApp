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

## Architecture

- **Interactive prompts** — `src/interactive.js` collects user input
- **System prompt** — built dynamically from story type, ending, and length (`src/prompts.js`)
- **User prompt** — built from subject and selected options
- **Agent** — `createAgent({ model, tools })` with `ChatOpenRouter` in `src/agent.js`
- **CLI** — `src/cli.js` — interactive when run with no arguments

## Environment

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
