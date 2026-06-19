const API_URL = import.meta.env.VITE_NORTHWIND_API_URL ?? '/api/query';

export async function askNorthwindAgent(question) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  const payload = await response.json().catch(() => {
    throw new Error('Server returned an invalid JSON response.');
  });

  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed with status ${response.status}.`);
  }

  return payload;
}
