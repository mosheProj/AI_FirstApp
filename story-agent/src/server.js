import http from 'node:http';
import { writeStory } from './agent.js';
import {
  DEFAULT_OPTIONS,
  ENDINGS,
  LENGTHS,
  STORY_TYPES,
  validateOptions,
  validateSubject,
} from './prompts.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
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
    message.includes('must be') ||
    message.includes('required') ||
    message.includes('cannot be empty') ||
    message.includes('must be one of')
  );
}

async function handleRequest(req, res) {
  const url = req.url?.split('?')[0] ?? '/';

  if (req.method === 'GET' && url === '/health') {
    sendJson(res, 200, { status: 'ok', service: 'story-agent' });
    return;
  }

  if (req.method === 'GET' && url === '/') {
    sendJson(res, 200, {
      service: 'story-agent',
      endpoints: {
        'GET /health': 'Health check',
        'POST /api/story': 'Generate a children\'s story',
      },
      defaults: DEFAULT_OPTIONS,
      options: {
        storyType: STORY_TYPES,
        ending: ENDINGS,
        length: LENGTHS,
      },
    });
    return;
  }

  if (req.method === 'POST' && url === '/api/story') {
    const body = await readJsonBody(req);
    const subject = validateSubject(body.subject);
    const options = validateOptions({
      storyType: body.storyType,
      ending: body.ending,
      length: body.length,
    });
    const story = await writeStory(subject, options);

    sendJson(res, 200, { subject, options, story });
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
  console.log(`Story agent API listening on http://${HOST}:${PORT}`);
  console.log(`  POST http://${HOST}:${PORT}/api/story`);
  console.log(`  GET  http://${HOST}:${PORT}/health`);
});
