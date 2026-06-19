import 'dotenv/config';

export const config = {
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number.parseInt(process.env.DB_PORT ?? process.env.POSTGRES_PORT ?? '5432', 10),
    user: process.env.DB_USER ?? process.env.POSTGRES_USER ?? 'postgres',
    password:
      process.env.DB_PASSWORD ?? process.env.POSTGRES_PASSWORD ?? 'Northwind_12345!',
    database: process.env.DB_NAME ?? process.env.POSTGRES_DB ?? 'northwind',
  },
  cohere: {
    apiKey: process.env.COHERE_API_KEY?.trim(),
    embeddingModel: process.env.COHERE_EMBED_MODEL ?? 'embed-v4.0',
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY?.trim(),
    model: process.env.OPENROUTER_MODEL ?? 'openai/gpt-5.4',
  },
  retriever: {
    k: Number.parseInt(process.env.RETRIEVER_K ?? '4', 10),
  },
};

export function requireCohereApiKey() {
  if (!config.cohere.apiKey || config.cohere.apiKey === 'your_cohere_api_key_here') {
    throw new Error('COHERE_API_KEY is missing. Add it to .env before ingestion or retrieval.');
  }

  return config.cohere.apiKey;
}

export function requireOpenRouterApiKey() {
  if (
    !config.openRouter.apiKey ||
    config.openRouter.apiKey === 'sk-or-v1-your-key'
  ) {
    throw new Error('OPENROUTER_API_KEY is missing. Add it to .env before running the agent.');
  }

  return config.openRouter.apiKey;
}
