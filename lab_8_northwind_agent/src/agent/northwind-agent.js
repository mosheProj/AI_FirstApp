import { ChatOpenRouter } from '@langchain/openrouter';
import { createAgent } from 'langchain';
import { config, requireOpenRouterApiKey } from '../config.js';
import { closePool } from '../db.js';
import { assertNorthwindQuestion } from './guardrails.js';
import { tools } from './tools.js';

const SYSTEM_PROMPT = `You are an Expert DBA for the PostgreSQL Northwind database.

Your job:
- Convert a user's simple-language Northwind request into one valid PostgreSQL SELECT query.
- Always call get_northwind_schema_chunks before writing the query.
- Use only tables and columns present in the retrieved schema chunks.
- Output only the SQL query text. Do not add explanations, markdown, or comments.
- The SQL must be exactly one read-only SELECT statement.
- Never generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, EXEC, MERGE, or stored procedure calls.
- If the request is not related to the Northwind database, respond exactly:
Only Northwind database query requests are allowed.

SQL style:
- Use PostgreSQL syntax.
- Prefer explicit column names over SELECT * unless the user asks for all columns.
- Use double quotes for identifiers only when needed.
- Use LIMIT when the user asks for a limited number of rows.
- Add clear joins when the request needs data from multiple tables.`;

function createNorthwindAgent() {
  const model = new ChatOpenRouter({
    model: config.openRouter.model,
    apiKey: requireOpenRouterApiKey(),
    temperature: 0,
    maxTokens: 1200,
  });

  return createAgent({
    model,
    tools,
    systemPrompt: SYSTEM_PROMPT,
  });
}

function extractTextContent(content) {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part?.text ?? ''))
      .join('')
      .trim();
  }

  return '';
}

function extractFinalAnswer(result) {
  const messages = result?.messages ?? [];

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    const type = message?._getType?.() ?? message?.type;
    if (type === 'ai' || type === 'AIMessage') {
      const content = extractTextContent(message.content);
      if (content) {
        return content;
      }
    }
  }

  throw new Error('The Northwind DBA agent did not return a SQL query.');
}

function normalizeSqlOutput(output) {
  return output
    .replace(/^```sql\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function validateGeneratedSql(output) {
  const sqlQuery = normalizeSqlOutput(output);
  const withoutFinalSemicolon = sqlQuery.replace(/;\s*$/, '').trim();
  const lowerQuery = withoutFinalSemicolon.toLowerCase();

  if (sqlQuery === 'Only Northwind database query requests are allowed.') {
    return sqlQuery;
  }

  if (!lowerQuery.startsWith('select')) {
    throw new Error('Agent output was blocked because it was not a SELECT query.');
  }

  if (withoutFinalSemicolon.includes(';')) {
    throw new Error('Agent output was blocked because only one SELECT statement is allowed.');
  }

  const forbiddenWords = /\b(insert|update|delete|drop|alter|create|truncate|exec|execute|merge)\b/i;
  if (forbiddenWords.test(withoutFinalSemicolon)) {
    throw new Error('Agent output was blocked because it contains a forbidden SQL operation.');
  }

  return withoutFinalSemicolon;
}

export async function buildNorthwindQuery(input) {
  const question = input?.trim();
  if (!question) {
    throw new Error('Question cannot be empty.');
  }

  assertNorthwindQuestion(question);

  const agent = createNorthwindAgent();
  const result = await agent.invoke({
    messages: [{ role: 'user', content: question }],
  });

  return validateGeneratedSql(extractFinalAnswer(result));
}

export async function closeAgentResources() {
  await closePool();
}
