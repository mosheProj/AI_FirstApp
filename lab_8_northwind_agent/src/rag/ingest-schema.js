import {
  closePool,
  executeNorthwindSchema,
  loadNorthwindData,
  waitForDatabase,
} from '../db.js';
import { getEmbeddingInfo } from './embeddings.js';
import { loadSchemaChunks } from './schema-chunks.js';
import { saveSchemaChunks } from './vector-store.js';

async function main() {
  console.log('Waiting for Postgres...');
  await waitForDatabase();

  console.log('Creating Northwind schema from sql/northwind.sql...');
  await executeNorthwindSchema();

  console.log('Loading Northwind data from sql/northwind-data.sql...');
  await loadNorthwindData();

  const chunks = await loadSchemaChunks();
  console.log(`Loaded ${chunks.length} schema chunks from comments + CREATE TABLE blocks.`);

  const embeddingInfo = getEmbeddingInfo();
  console.log(`Embedding schema chunks with ${embeddingInfo.provider}/${embeddingInfo.model}...`);
  await saveSchemaChunks(chunks);

  console.log('Saved schema vectors to northwind.schema_vector_chunks.');
}

main()
  .catch((error) => {
    console.error('Northwind schema ingestion failed.');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
