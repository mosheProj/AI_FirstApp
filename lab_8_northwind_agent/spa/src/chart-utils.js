function isNumberLike(value) {
  return value !== null && value !== '' && Number.isFinite(Number(value));
}

export function detectChartType(question) {
  const normalized = question.toLowerCase();

  if (normalized.includes('pie') || normalized.includes('pai')) {
    return 'pie';
  }

  if (
    normalized.includes('line') ||
    normalized.includes('linear') ||
    normalized.includes('trend') ||
    normalized.includes('monthly')
  ) {
    return 'line';
  }

  if (normalized.includes('bar') || normalized.includes('chart') || normalized.includes('report')) {
    return 'bar';
  }

  return 'table';
}

export function buildChartData(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const columns = Object.keys(rows[0] ?? {});
  const numericColumn = columns.find((column) =>
    rows.some((row) => isNumberLike(row[column])),
  );

  if (!numericColumn) {
    return null;
  }

  const labelColumn =
    columns.find((column) => column !== numericColumn && rows.some((row) => row[column] !== null)) ??
    columns[0];

  return {
    labelColumn,
    valueColumn: numericColumn,
    points: rows.slice(0, 12).map((row, index) => ({
      label: String(row[labelColumn] ?? `Row ${index + 1}`),
      value: Number(row[numericColumn] ?? 0),
    })),
  };
}
