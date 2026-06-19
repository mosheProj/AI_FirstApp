export default function ResultTable({ rows }) {
  if (!rows?.length) {
    return <p className="empty-state">No rows returned.</p>;
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 100).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column}>{row[column] === null ? 'NULL' : String(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 100 && (
        <p className="table-note">Showing first 100 rows out of {rows.length}.</p>
      )}
    </div>
  );
}
