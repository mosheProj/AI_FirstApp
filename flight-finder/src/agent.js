import './env.js';
import { ChatOpenRouter } from '@langchain/openrouter';
import { createAgent } from 'langchain';
import {
  buildUserPrompt,
  sortFlightsByPrice,
  SYSTEM_PROMPT,
} from './prompts.js';
import {
  buildFlightsFromTavily,
  ensureFlightCount,
  mergeFlights,
} from './flightParser.js';
import { applyTargetCurrencyToFlights } from './services/currency.js';
import { FlightsResponseSchema, validateSearchParams } from './schemas.js';
import { tools } from './tools.js';

function getOpenRouterApiKey() {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    throw new Error(
      'OPENROUTER_API_KEY is not set in flight-finder/.env\n' +
        'Add: OPENROUTER_API_KEY=sk-or-v1-your-key',
    );
  }
  if (key === 'your_openrouter_api_key_here') {
    throw new Error(
      'OPENROUTER_API_KEY is still the placeholder. Edit flight-finder/.env and save.',
    );
  }
  return key;
}

function createFlightAgent() {
  const model = new ChatOpenRouter({
    model: 'openai/gpt-5.4',
    apiKey: getOpenRouterApiKey(),
    temperature: 0.2,
    maxTokens: 4096,
  });

  return createAgent({
    model,
    tools,
    systemPrompt: SYSTEM_PROMPT,
    responseFormat: FlightsResponseSchema,
  });
}

function extractToolPayloads(messages) {
  const payloads = [];
  for (const msg of messages ?? []) {
    const type = msg?._getType?.() ?? msg?.type;
    if (type !== 'tool') continue;

    const content =
      typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
    try {
      payloads.push(JSON.parse(content));
    } catch {
      payloads.push({ raw: content });
    }
  }
  return payloads;
}

export async function findFlights(params) {
  const validated = validateSearchParams(params);
  const agent = createFlightAgent();
  const userPrompt = buildUserPrompt(validated);

  const result = await agent.invoke({
    messages: [{ role: 'user', content: userPrompt }],
  });

  const toolPayloads = extractToolPayloads(result.messages);
  const tavilyFlights = buildFlightsFromTavily(validated, toolPayloads);
  const llmFlights = result.structuredResponse?.flights ?? [];

  let flights = mergeFlights(tavilyFlights, llmFlights, validated);
  flights = ensureFlightCount(flights, validated, toolPayloads);

  if (!flights.length) {
    throw new Error(
      'No flights were found. Try different city names or dates, or check your API keys and internet connection.',
    );
  }

  flights = await applyTargetCurrencyToFlights(flights, validated.currency);
  flights = sortFlightsByPrice(flights).slice(0, 5);

  return {
    params: validated,
    flights,
  };
}

export { tools };
