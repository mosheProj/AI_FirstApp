import { useEffect, useMemo, useRef, useState } from 'react';
import { askNorthwindAgent } from './api.js';
import { buildChartData, detectChartType } from './chart-utils.js';
import ChatComposer from './components/ChatComposer.jsx';
import Message from './components/Message.jsx';
import { validateQuestion } from './validation.js';

const EXAMPLES = [
  'Show a pie chart for customer : Company H ,  for all product revenue',
  'Sales revenue by product in a bar chart',
  'Top 5 customers by total order amount',
];

function createMessage(role, payload) {
  return {
    id: crypto.randomUUID(),
    role,
    ...payload,
  };
}

export default function App() {
  const resultEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    createMessage('assistant', {
      text: 'Ask a read-only Northwind question. I will generate SQL, run it, and show the data as a table or chart.',
    }),
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lastResult = useMemo(
    () => [...messages].reverse().find((message) => message.rows),
    [messages],
  );

  useEffect(() => {
    resultEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  async function handleSubmit(event) {
    event.preventDefault();

    const question = input.trim();
    const validationError = validateQuestion(question);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    setInput('');
    const thinkingMessageId = crypto.randomUUID();
    setMessages((current) => [
      ...current,
      createMessage('user', { text: question }),
      createMessage('assistant', {
        id: thinkingMessageId,
        text: 'Thinking...',
        loading: true,
      }),
    ]);

    try {
      const response = await askNorthwindAgent(question);
      const chartType = detectChartType(question);
      const chartData = buildChartData(response.rows);

      setMessages((current) =>
        current.map((message) => message.id === thinkingMessageId ? {
          ...message,
          text: `Returned ${response.rowCount} row(s).`,
          sql: response.sql,
          rowCount: response.rowCount,
          rows: response.rows,
          chartType,
          chartData,
          loading: false,
        } : message),
      );
    } catch (requestError) {
      setMessages((current) =>
        current.map((message) => message.id === thinkingMessageId ? {
          ...message,
          text:
            requestError instanceof Error
              ? requestError.message
              : 'Request failed.',
          loading: false,
        } : message),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <p className="eyebrow">Northwind RAG Agent</p>
        <h1>DBA Chatbot</h1>
        <p>
          Ask simple text questions. The server generates a safe PostgreSQL
          SELECT query, executes it, and returns the result set.
        </p>

        <div className="guardrail-card">
          <h2>Guardrails</h2>
          <ul>
            <li>Northwind database only</li>
            <li>Read-only data retrieval</li>
            <li>No INSERT / UPDATE / DELETE</li>
            <li>Single SELECT statement enforced server-side</li>
          </ul>
        </div>

        <div className="examples">
          <h2>Try prompts</h2>
          {EXAMPLES.map((example) => (
            <button key={example} type="button" onClick={() => setInput(example)}>
              {example}
            </button>
          ))}
        </div>

        {lastResult && (
          <div className="stats-card">
            <span>Last result</span>
            <strong>{lastResult.rowCount} rows</strong>
          </div>
        )}
      </aside>

      <section className="chat-shell">
        <header>
          <div>
            <p className="eyebrow">Postgres Northwind</p>
            <h2>Query Results Chat</h2>
          </div>
          <span className={loading ? 'status status--active' : 'status'}>
            {loading ? 'Running query' : 'Ready'}
          </span>
        </header>

        <div className="messages">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          <div ref={resultEndRef} />
        </div>

        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </section>
    </main>
  );
}
