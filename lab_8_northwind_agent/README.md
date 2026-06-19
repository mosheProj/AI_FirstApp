# Lab 8 Northwind DBA Agent

Dockerized Node.js + LangChain agent that builds PostgreSQL queries for the
Northwind database from simple-language requests.

## Source Data

This lab uses the Northwind MySQL repo:

https://github.com/busynovadad/northwind-MySQL

Files used:

- `sql/northwind.sql` - schema
- `sql/northwind-data.sql` - data

The Node/RAG/agent container uses `node:20-alpine`. The database container uses
Postgres. During ingestion, the MySQL source files are converted to PostgreSQL
DDL/DML before loading.

## What This Project Contains

- Postgres container with the `northwind` database
- Node.js container based on `node:20-alpine`
- RAG ingestion process for Northwind schema chunks
- Schema vector table stored inside Northwind:
  `schema_vector_chunks`
- LangChain Expert DBA agent
- CLI for asking the agent to build queries

## Agent Role

Role: **Expert DBA**

Input:

```text
get all customer
```

Output:

```sql
SELECT
  id,
  company,
  first_name,
  last_name,
  city,
  country_region
FROM customers;
```

The agent only accepts questions related to the Northwind database. Other
questions are rejected.

## Setup

1. Create your environment file:

```powershell
cd lab_8_northwind_agent
copy .env.example .env
```

2. Edit `.env` and set:

```env
COHERE_API_KEY=your_cohere_api_key_here
OPENROUTER_API_KEY=sk-or-v1-your-key
```

## Run Docker

Start Postgres:

```powershell
docker compose up -d postgres
```

Build the Node 20 Alpine agent image:

```powershell
docker compose build northwind-agent
```

## Run The RAG Ingestion

The ingestion process:

1. Waits for Postgres
2. Converts and runs `sql/northwind.sql`
3. Converts and runs `sql/northwind-data.sql`
4. Splits `northwind.sql` by comment blocks before each `CREATE TABLE`
5. Embeds every schema chunk with Cohere
6. Saves chunks and vectors into `northwind.schema_vector_chunks`

Run:

```powershell
docker compose run --rm northwind-agent npm run ingest
```

Expected output includes:

```text
Loaded 20 schema chunks from comments + CREATE TABLE blocks.
Saved schema vectors to northwind.schema_vector_chunks.
```

## Run The Agent CLI

Run inside Docker:

```powershell
docker compose run --rm northwind-agent npm run agent -- "get all customers"
```

More examples:

```powershell
docker compose run --rm northwind-agent npm run agent -- "show orders with customer company names"
docker compose run --rm northwind-agent npm run agent -- "get products with supplier and category"
docker compose run --rm northwind-agent npm run agent -- "calculate sales revenue by product"
```

Interactive mode:

```powershell
docker compose run --rm northwind-agent npm run agent -- -i
```

## Run The Agent API Server

The server exposes the same agent over HTTP.

Start the server in Docker:

```powershell
docker compose up -d northwind-agent
```

Default URL:

```text
http://localhost:3009
```

Health check:

```powershell
curl.exe http://localhost:3009/health
```

Generate and execute a SQL query:

```powershell
Invoke-RestMethod -Method POST "http://localhost:3009/query" `
  -ContentType "application/json" `
  -Body '{"question":"get all customers"}'
```

Or with curl using a JSON file:

```powershell
Set-Content -Path query-body.json -Value '{"question":"sales revenue by product"}' -NoNewline
curl.exe -X POST "http://localhost:3009/query" -H "Content-Type: application/json" --data-binary "@query-body.json"
```

Expected response:

```json
{
  "question": "get all customers",
  "sql": "SELECT id, company, last_name, first_name, ... FROM customers",
  "rowCount": 29,
  "rows": [
    {
      "id": 1,
      "company": "Company A",
      "last_name": "Bedecs",
      "first_name": "Anna"
    }
  ]
}
```

The API only accepts Northwind database requests. It asks the agent to create a
single read-only `SELECT` query, executes that query against Postgres, and
returns the result set.

## How The Agent Works

The agent has one tool:

```text
get_northwind_schema_chunks
```

Tool behavior:

1. Validates that the request is about Northwind
2. Embeds the user's request
3. Connects to Postgres
4. Reads vectors from `schema_vector_chunks`
5. Returns the most relevant schema chunks

The LangChain agent then uses the returned schema chunks to build the final
PostgreSQL `SELECT` query.

## Important Guardrail

The agent is restricted to Northwind database query requests.

Allowed:

```text
get all customers
show orders with customer names
find discontinued products
```

Rejected:

```text
write a poem
what is OAuth
delete all customers
```

The agent is limited to exactly one read-only `SELECT` statement. The system
prompt forbids:

- `INSERT`
- `UPDATE`
- `DELETE`
- `DROP`
- `ALTER`
- `CREATE`
- `TRUNCATE`
- `EXEC`
- `MERGE`

The final agent output is validated in code. If it is not a single `SELECT`
statement, or if it contains a write/destructive operation, it is blocked.

## Connect To Postgres

From your host machine:

```text
Host: localhost
Port: 5433
Database: northwind
User: postgres
Password: Northwind_12345!
```

If you changed `POSTGRES_PASSWORD` in `.env`, use that password.

Useful SQL checks:

```sql
SHOW TABLES;

SELECT
  chunk_key,
  embedding_model,
  created_at
FROM schema_vector_chunks;
```

## Enter Docker Containers By CLI

Open a Postgres SQL shell using Compose:

```powershell
docker compose exec postgres psql -U postgres -d northwind
```

Or with the container name:

```powershell
docker exec -it lab8-northwind-postgres psql -U postgres -d northwind
```

Enter the Node 20 Alpine agent container shell:

```powershell
docker compose run --rm northwind-agent sh
```

From inside the agent container you can run:

```sh
npm run ingest
npm run agent -- "get all customers"
```

## Local Development Without Docker

Install dependencies:

```powershell
npm install
```

Set DB values in `.env` to point to your Postgres server:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=Northwind_12345!
DB_NAME=northwind
```

Run:

```powershell
npm run ingest
npm run agent -- "get all customers"
```

## Stop Containers

```powershell
docker compose down
```

Remove Postgres data too:

```powershell
docker compose down -v
```
