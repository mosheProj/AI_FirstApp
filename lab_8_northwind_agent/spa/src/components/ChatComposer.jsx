import { MAX_QUESTION_LENGTH } from '../validation.js';

export default function ChatComposer({ value, onChange, onSubmit, loading, error }) {
  const remaining = MAX_QUESTION_LENGTH - value.length;

  return (
    <form className="composer" onSubmit={onSubmit}>
      <div className="composer__box">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Example: Show a pie chart for customer : Company H ,  for all product revenue"
          maxLength={MAX_QUESTION_LENGTH}
          rows={3}
          disabled={loading}
        />
        <div className="composer__actions">
          <span className={remaining < 40 ? 'warn' : ''}>{remaining} chars left</span>
          <button type="submit" disabled={loading || !value.trim()}>
            {loading ? 'Running...' : 'Ask Northwind'}
          </button>
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
    </form>
  );
}
