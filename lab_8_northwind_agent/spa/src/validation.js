const NORTHWIND_TERMS = [
  'northwind',
  'customer',
  'customers',
  'order',
  'orders',
  'product',
  'products',
  'supplier',
  'suppliers',
  'employee',
  'employees',
  'shipper',
  'shippers',
  'invoice',
  'invoices',
  'inventory',
  'purchase',
  'sales',
  'revenue',
  'report',
  'chart',
  'table',
  'data',
  'count',
  'total',
  'average',
  'quantity',
  'discount',
  'price',
];

const FORBIDDEN_TERMS = [
  'insert',
  'update',
  'delete',
  'drop',
  'alter',
  'create',
  'truncate',
  'merge',
  'execute',
  'exec',
  'remove',
  'change',
  'modify',
];

export const MAX_QUESTION_LENGTH = 300;

export function validateQuestion(question) {
  const normalized = question.trim().toLowerCase();

  if (!normalized) {
    return 'Please enter a Northwind data request.';
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return `Question must be at most ${MAX_QUESTION_LENGTH} characters.`;
  }

  if (!NORTHWIND_TERMS.some((term) => normalized.includes(term))) {
    return 'Ask only read-only questions related to the Northwind database.';
  }

  if (FORBIDDEN_TERMS.some((term) => new RegExp(`\\b${term}\\b`).test(normalized))) {
    return 'Only read-only data retrieval is allowed. INSERT, UPDATE, DELETE, and other write operations are blocked.';
  }

  return '';
}
