const baseUrl = process.env.API_URL ?? 'http://127.0.0.1:3001';

const payload = {
  source: 'London',
  destination: 'Paris',
  startDate: '2026-09-15',
  endDate: '2026-09-22',
  currency: 'EUR',
  passengers: '2',
  checkSpecialOffers: true,
};

async function main() {
  console.log(`GET ${baseUrl}/health`);
  const health = await fetch(`${baseUrl}/health`);
  console.log(await health.json());

  console.log(`\nGET ${baseUrl}/api`);
  const info = await fetch(`${baseUrl}/api`);
  console.log(await info.json());

  console.log(`\nPOST ${baseUrl}/api/flights`);
  const response = await fetch(`${baseUrl}/api/flights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(`Error ${response.status}:`, data.error ?? data);
    process.exit(1);
  }

  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error(
    `\nCould not reach ${baseUrl}. Is the server running?\n  cd flight-finder && npm run server\n`,
  );
  console.error(error.message);
  process.exit(1);
});
