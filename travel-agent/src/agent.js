import './env.js';
import { ChatOpenRouter } from '@langchain/openrouter';
import { createAgent } from 'langchain';
import {
  buildUserPrompt,
  sortOffersByPriceDesc,
  SYSTEM_PROMPT,
  validateSearchParams,
} from './prompts.js';
import { OffersResponseSchema } from './schemas.js';
import {
  buildFallbackOffers,
  ensurePerHotelLinks,
  sanitizeOfferPrices,
} from './searchUtils.js';
import { tools } from './tools.js';

function getApiKey() {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    throw new Error(
      'OPENROUTER_API_KEY is not set in travel-agent/.env\n' +
        'Add: OPENROUTER_API_KEY=sk-or-v1-your-key',
    );
  }
  if (key === 'your_openrouter_api_key_here') {
    throw new Error(
      'OPENROUTER_API_KEY is still the placeholder. Edit travel-agent/.env and save.',
    );
  }
  return key;
}

function createTravelAgent() {
  const model = new ChatOpenRouter({
    model: 'openai/gpt-5.4',
    apiKey: getApiKey(),
    temperature: 0.2,
    maxTokens: 4096,
  });

  return createAgent({
    model,
    tools,
    systemPrompt: SYSTEM_PROMPT,
    responseFormat: OffersResponseSchema,
  });
}

function extractToolPayload(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    const type = msg?._getType?.() ?? msg?.type;
    if (type !== 'tool') continue;

    const content =
      typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
    try {
      return JSON.parse(content);
    } catch {
      // not JSON
    }
  }
  return null;
}

function extractFromToolMessages(messages) {
  const data = extractToolPayload(messages);
  if (!data) return null;

  if (data.fallbackOffers?.length) {
    return sortOffersByPriceDesc(data.fallbackOffers);
  }

  const premium = (data.parsedListings ?? []).filter((l) => l.isPremium);
  if (premium.length) {
    return buildFallbackOffers(premium, {
      location: data.location ?? '',
      startDate: data.startDate ?? '',
      endDate: data.endDate ?? '',
      adults: data.adults ?? '2',
    });
  }

  return null;
}

export async function findTravelOffers(params) {
  const validated = validateSearchParams(params);
  const agent = createTravelAgent();
  const userPrompt = buildUserPrompt(validated);

  const result = await agent.invoke({
    messages: [{ role: 'user', content: userPrompt }],
  });

  const toolData = extractToolPayload(result.messages);
  const parsedListings = toolData?.parsedListings ?? [];

  let offers = result.structuredResponse?.offers ?? [];

  if (!offers.length) {
    offers = extractFromToolMessages(result.messages) ?? [];
  }

  if (!offers.length) {
    throw new Error(
      'No offers were found. The travel sites may be unreachable, or the model could not parse results. Try again or use a major city name (e.g. "Eilat" instead of "Israel south").',
    );
  }

  offers = sortOffersByPriceDesc(
    sanitizeOfferPrices(ensurePerHotelLinks(offers, validated), parsedListings),
  );

  return {
    params: validated,
    offers,
  };
}

export { tools };
