# World Cup 2026 Hub

A professional single-page application for the FIFA World Cup 2026 — featuring match schedules, team squads, and group draw information.

## Features

- **Home** — Hero overview with tournament stats and featured matches
- **Schedule** — Full match calendar with stage/group filters and search
- **Teams** — Squad listings with player details by position
- **Groups & Nations** — Group draw and all 48 qualified nations by confederation

## Getting Started

**Do not open `index.html` directly in the browser.** This app uses Vite and must be served by the dev server.

### Option 1 — Double-click (Windows)

Double-click **`start.bat`** in the project folder.

### Option 2 — Terminal

```bash
npm install
npm start
```

Your browser will open automatically at [http://localhost:5173](http://localhost:5173).

If port 5173 is busy, check the terminal for the actual URL (e.g. `http://localhost:5174`).

## Build

```bash
npm run build
npm run preview
```

## Cursor GitHub MCP

This repo includes a Cursor MCP config at `.cursor/mcp.json` with a GitHub MCP
server named `github` for the current repository:

```text
https://github.com/mosheProj/AI_FirstApp
```

Set your GitHub personal access token locally before using the MCP. Do not
commit the token.

PowerShell:

```powershell
$env:GITHUB_PERSONAL_ACCESS_TOKEN="your_github_pat_here"
```

Then restart Cursor or reload MCP servers from Cursor settings.

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router

## Data

Tournament data sourced from official FIFA World Cup 2026 datasets (squads, schedule, groups).
