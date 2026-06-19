import { tool } from 'langchain';
import * as z from 'zod';
import { retrieveSchemaChunks } from '../rag/vector-store.js';
import { assertNorthwindQuestion } from './guardrails.js';

export const getNorthwindSchemaChunks = tool(
  async ({ query }) => {
    assertNorthwindQuestion(query);

    const chunks = await retrieveSchemaChunks(query);
    return JSON.stringify(
      {
        count: chunks.length,
        chunks: chunks.map((chunk) => ({
          table: chunk.key,
          score: Number(chunk.score.toFixed(4)),
          schema: chunk.text,
        })),
      },
      null,
      2,
    );
  },
  {
    name: 'get_northwind_schema_chunks',
    description:
      'Retrieve relevant Northwind table schema chunks from Postgres for building a SELECT query.',
    schema: z.object({
      query: z
        .string()
        .trim()
        .min(1)
        .max(300)
        .describe('The user request for a Northwind database SQL query'),
    }),
  },
);

export const tools = [getNorthwindSchemaChunks];
