import http from 'node:http';
import { findFlights } from './agent.js';
import './env.js';
import { validateSearchParams } from './schemas.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const HOST = process.env.HOST ?? '127.0.0.1';

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.statusCode = 400;
    throw error;
  }
}

function isValidationError(message) {
  return (
    message.includes('is required') ||
    message.includes('cannot be empty') ||
    message.includes('must be at most') ||
    message.includes('checkSpecialOffers must be')
  );
}

async function handleRequest(req, res) {
  const url = req.url?.split('?')[0] ?? '/';

  if (req.method === 'GET' && url === '/health') {
    sendJson(res, 200, { status: 'ok', service: 'flight-finder' });
    return;
  }

  if (req.method === 'GET' && url === '/api') {
    sendJson(res, 200, {
      service: 'flight-finder',
      endpoints: {
        'GET /health': 'Health check',
        'GET /api': 'API info',
        'POST /api/flights': 'Search for cheapest flights',
      },
      requiredBody: {
        source: 'string',
        destination: 'string',
        startDate: 'string',
        endDate: 'string',
        currency: 'string',
        passengers: 'string',
      },
      optionalBody: {
        checkSpecialOffers: 'boolean (default: true)',
      },
    });
    return;
  }

  if (req.method === 'POST' && url === '/api/flights') {
    const body = await readJsonBody(req);
    const params = validateSearchParams(body);
    const { flights } = await findFlights(params);

    sendJson(res, 200, { params, flights });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    const status = error.statusCode ?? (isValidationError(error.message) ? 400 : 500);
    sendJson(res, status, { error: error.message });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Flight Finder listening on http://${HOST}:${PORT}`);
  console.log(`  Health  GET  http://${HOST}:${PORT}/health`);
  console.log(`  API     GET  http://${HOST}:${PORT}/api`);
  console.log(`  Flights POST http://${HOST}:${PORT}/api/flights`);
});
