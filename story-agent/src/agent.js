import './env.js';
import { ChatOpenRouter } from '@langchain/openrouter';
import { createAgent } from 'langchain';
import {
  buildSystemPrompt,
  buildUserPrompt,
  creativityToTemperature,
  limitToSentences,
  SENTENCE_LIMITS,
  validateOptions,
  validateSubject,
} from './prompts.js';

const tools = [];

function getApiKey() {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    throw new Error(
      'OPENROUTER_API_KEY is not set in story-agent/.env\n' +
        'Add one line: OPENROUTER_API_KEY=sk-or-v1-your-key',
    );
  }
  if (key === 'your_openrouter_api_key_here') {
    throw new Error(
      'OPENROUTER_API_KEY is still the placeholder value.\n' +
        'Open story-agent/.env, replace it with your real OpenRouter key, and save the file.\n' +
        'Do NOT run "copy .env.example .env" again — that resets your key.',
    );
  }
  return key;
}

function createStoryAgent(systemPrompt, temperature) {
  const model = new ChatOpenRouter({
    model: 'openai/gpt-5.4',
    apiKey: getApiKey(),
    temperature,
    maxTokens: 768,
  });

  return createAgent({
    model,
    tools,
    systemPrompt,
  });
}

function extractStoryContent(result) {
  const messages = result?.messages ?? [];
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    const type = message?._getType?.() ?? message?.type;
    if (type === 'ai' || type === 'AIMessage') {
      const content = message.content;
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        return content
          .map((part) => (typeof part === 'string' ? part : part?.text ?? ''))
          .join('')
          .trim();
      }
    }
  }
  throw new Error('No story was returned by the agent.');
}

export async function writeStory(subject, options = {}) {
  const validatedSubject = validateSubject(subject);
  const validatedOptions = validateOptions(options);
  const systemPrompt = buildSystemPrompt(validatedOptions);
  const userPrompt = buildUserPrompt(validatedSubject, validatedOptions);
  const maxSentences = SENTENCE_LIMITS[validatedOptions.length];

  const temperature = creativityToTemperature(validatedOptions.creativity);
  const agent = createStoryAgent(systemPrompt, temperature);

  const result = await agent.invoke({
    messages: [{ role: 'user', content: userPrompt }],
  });

  const rawStory = extractStoryContent(result);
  return limitToSentences(rawStory, maxSentences);
}

export { tools };
