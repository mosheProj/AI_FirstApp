const COLORS = ['#38bdf8', '#22c55e', '#a78bfa', '#f59e0b', '#fb7185', '#14b8a6', '#60a5fa', '#f97316'];

function formatValue(value) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function formatPercent(value, total) {
  if (!total) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

function getTotal(points) {
  return points.reduce((sum, point) => sum + Math.max(point.value, 0), 0);
}

function BarChart({ data }) {
  const max = Math.max(...data.points.map((point) => point.value), 1);

  return (
    <div className="bar-chart">
      {data.points.map((point, index) => (
        <div className="bar-row" key={`${point.label}-${index}`}>
          <span className="bar-rank">{index + 1}</span>
          <span className="bar-label" title={point.label}>{point.label}</span>
          <div className="bar-track">
            <span
              className="bar-fill"
              style={{
                width: `${Math.max((point.value / max) * 100, 2)}%`,
                background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, rgba(255, 255, 255, 0.82))`,
              }}
            />
          </div>
          <span className="bar-value">{formatValue(point.value)}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data }) {
  const width = 640;
  const height = 300;
  const padding = 46;
  const values = data.points.map((point) => point.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const xStep = data.points.length > 1
    ? (width - padding * 2) / (data.points.length - 1)
    : 0;

  const points = data.points.map((point, index) => {
    const x = padding + index * xStep;
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
    return { ...point, x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = `${path} L ${points.at(-1)?.x ?? padding} ${height - padding} L ${padding} ${height - padding} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = height - padding - ratio * (height - padding * 2);
    const value = min + ratio * range;
    return { y, value };
  });

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart">
        <defs>
          <linearGradient id="line-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {gridLines.map((line) => (
          <g key={line.y}>
            <line className="chart-grid" x1={padding} y1={line.y} x2={width - padding} y2={line.y} />
            <text className="axis-label" x={padding - 10} y={line.y + 4} textAnchor="end">
              {formatValue(line.value)}
            </text>
          </g>
        ))}
        <path className="line-area" d={areaPath} />
        <path d={path} />
        {points.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle cx={point.x} cy={point.y} r="5" />
            <text className="axis-label axis-label--x" x={point.x} y={height - 12} textAnchor="middle">
              {point.label.length > 10 ? `${point.label.slice(0, 10)}...` : point.label}
            </text>
            <title>{`${point.label}: ${formatValue(point.value)}`}</title>
          </g>
        ))}
      </svg>
      <div className="line-chart__legend">
        {points.map((point, index) => (
          <span key={`${point.label}-${index}`}>
            {point.label}: {formatValue(point.value)}
          </span>
        ))}
      </div>
    </div>
  );
}

function PieChart({ data }) {
  const total = getTotal(data.points);
  let offset = 0;

  const gradient = data.points
    .map((point, index) => {
      const start = offset;
      const slice = total === 0 ? 0 : (Math.max(point.value, 0) / total) * 100;
      offset += slice;
      return `${COLORS[index % COLORS.length]} ${start}% ${offset}%`;
    })
    .join(', ');

  return (
    <div className="pie-chart">
      <div className="pie-wrap">
        <div
          className="pie"
          style={{
            background: `conic-gradient(${gradient || '#334155 0% 100%'})`,
          }}
        >
          <div className="pie-hole">
            <span>Total</span>
            <strong>{formatValue(total)}</strong>
          </div>
        </div>
      </div>
      <div className="pie-legend">
        {data.points.map((point, index) => (
          <div className="pie-legend__item" key={`${point.label}-${index}`}>
            <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }} />
            <p title={point.label}>{point.label}</p>
            <strong>{formatValue(point.value)}</strong>
            <em>{formatPercent(point.value, total)}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChartPanel({ type, data }) {
  if (!data || type === 'table') return null;
  const total = getTotal(data.points);

  return (
    <section className="chart-card">
      <div className="chart-card__header">
        <div>
          <p className="eyebrow">Visualization</p>
          <h3>{type === 'pie' ? 'Pie chart' : type === 'line' ? 'Line chart' : 'Bar chart'}</h3>
        </div>
        <div className="chart-summary">
          <span>{data.points.length} points</span>
          <strong>{formatValue(total)}</strong>
          <small>{data.valueColumn}</small>
        </div>
      </div>
      {type === 'pie' && <PieChart data={data} />}
      {type === 'line' && <LineChart data={data} />}
      {type === 'bar' && <BarChart data={data} />}
    </section>
  );
}
