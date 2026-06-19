import { config } from '../config.js';
import { ensureVectorTable, getPool } from '../db.js';
import { createEmbeddings, getEmbeddingInfo } from './embeddings.js';

function cosineSimilarity(left, right) {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let i = 0; i < left.length; i += 1) {
    dot += left[i] * right[i];
    leftMagnitude += left[i] * left[i];
    rightMagnitude += right[i] * right[i];
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export async function saveSchemaChunks(chunks) {
  await ensureVectorTable();

  const embeddings = createEmbeddings();
  const { model } = getEmbeddingInfo();
  const dbPool = await getPool();

  await dbPool.query('DELETE FROM schema_vector_chunks');

  for (const chunk of chunks) {
    const [embedding] = await embeddings.embedDocuments([chunk.text]);
    await dbPool.query(
      `
        INSERT INTO schema_vector_chunks
          (chunk_key, chunk_text, embedding, embedding_model)
        VALUES
          ($1, $2, $3, $4)
      `,
      [chunk.key, chunk.text, JSON.stringify(embedding), model],
    );
  }
}

export async function retrieveSchemaChunks(query, k = config.retriever.k) {
  await ensureVectorTable();

  const embeddings = createEmbeddings();
  const queryEmbedding = await embeddings.embedQuery(query);
  const dbPool = await getPool();
  const result = await dbPool.query(`
    SELECT id, chunk_key, chunk_text, embedding, embedding_model
    FROM schema_vector_chunks
  `);

  return result.rows
    .map((row) => ({
      id: row.id,
      key: row.chunk_key,
      text: row.chunk_text,
      model: row.embedding_model,
      score: cosineSimilarity(queryEmbedding, JSON.parse(row.embedding)),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, k);
}
