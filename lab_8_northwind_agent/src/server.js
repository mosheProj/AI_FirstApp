import http from 'node:http';
import { URL } from 'node:url';
import * as z from 'zod';
import { config } from './config.js';
import { buildNorthwindQuery, closeAgentResources } from './agent/northwind-agent.js';
import { isNorthwindQuestion } from './agent/guardrails.js';
import { getPool } from './db.js';

const requestSchema = z.object({
  question: z.string().trim().min(1).max(300),
});

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8').trim();
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error('Request body must be valid JSON.');
  }
}

async function handleQuery(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : 'Invalid request body.',
    });
    return;
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    sendJson(res, 400, {
      error: parsed.error.issues[0]?.message ?? 'Invalid question.',
      example: { question: 'get all customers' },
    });
    return;
  }

  const { question } = parsed.data;
  if (!isNorthwindQuestion(question)) {
    sendJson(res, 400, {
      error: 'Only Northwind database query requests are allowed.',
    });
    return;
  }

  const sql = await buildNorthwindQuery(question);
  const pool = await getPool();
  const result = await pool.query(sql);

  sendJson(res, 200, {
    question,
    sql,
    rowCount: result.rowCount,
    rows: result.rows,
  });
}

async function handleRequest(req, res) {
  const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/health') {
    sendJson(res, 200, {
      status: 'ok',
      service: 'northwind-agent-api',
    });
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/query') {
    await handleQuery(req, res);
    return;
  }

  sendJson(res, 404, {
    error: 'Not found',
    endpoints: [
      'GET /health',
      'POST /query  body: { "question": "get all customers" }',
    ],
  });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  });
});

server.listen(config.server.port, config.server.host, () => {
  console.log(
    `Northwind agent API listening on http://${config.server.host}:${config.server.port}`,
  );
  console.log(`  GET  /health`);
  console.log(`  POST /query`);
});

process.on('SIGINT', async () => {
  await closeAgentResources();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', async () => {
  await closeAgentResources();
  server.close(() => process.exit(0));
});
