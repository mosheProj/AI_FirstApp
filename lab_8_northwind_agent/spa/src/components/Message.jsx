import ChartPanel from './ChartPanel.jsx';
import ResultTable from './ResultTable.jsx';

export default function Message({ message }) {
  const isUser = message.role === 'user';

  return (
    <article className={`message ${isUser ? 'message--user' : 'message--assistant'}`}>
      <div className="message__avatar">{isUser ? 'You' : 'DBA'}</div>
      <div className="message__content">
        <div className="message__header">
          <strong>{isUser ? 'Request' : 'Northwind Agent'}</strong>
          {message.rowCount !== undefined && <span>{message.rowCount} rows</span>}
        </div>
        <p>{message.text}</p>
        {message.loading && (
          <div className="thinking-dots" aria-label="Agent is thinking">
            <span />
            <span />
            <span />
          </div>
        )}
        {message.sql && (
          <pre className="sql-block">
            <code>{message.sql}</code>
          </pre>
        )}
        <ChartPanel type={message.chartType} data={message.chartData} />
        {message.rows && <ResultTable rows={message.rows} />}
      </div>
    </article>
  );
}
