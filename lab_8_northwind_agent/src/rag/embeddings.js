import { CohereEmbeddings } from '@langchain/cohere';
import { config, requireCohereApiKey } from '../config.js';

export function createEmbeddings() {
  return new CohereEmbeddings({
    model: config.cohere.embeddingModel,
    apiKey: requireCohereApiKey(),
  });
}

export function getEmbeddingInfo() {
  return {
    provider: 'cohere',
    model: config.cohere.embeddingModel,
  };
}
