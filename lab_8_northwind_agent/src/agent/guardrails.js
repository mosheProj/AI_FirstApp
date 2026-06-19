const NORTHWIND_TERMS = [
  'northwind',
  'customer',
  'customers',
  'client',
  'clients',
  'order',
  'orders',
  'product',
  'products',
  'category',
  'categories',
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
  'purchases',
  'transaction',
  'transactions',
  'freight',
  'revenue',
  'sales',
  'discount',
  'quantity',
  'price',
  'stock',
  'city',
  'country',
  'company',
  'contact',
  'table',
  'schema',
  'sql',
  'query',
  'select',
  'join',
];

export function isNorthwindQuestion(input) {
  const normalized = input.toLowerCase();
  return NORTHWIND_TERMS.some((term) => normalized.includes(term));
}

export function assertNorthwindQuestion(input) {
  if (!isNorthwindQuestion(input)) {
    throw new Error('Only Northwind database query requests are allowed.');
  }
}
