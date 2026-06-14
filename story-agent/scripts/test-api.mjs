const baseUrl = process.env.API_URL ?? 'http://127.0.0.1:3000';

const payload = {
  subject: 'a haunted treehouse',
  storyType: 'scary',
  ending: 'bad',
  length: 'long',
};

async function main() {
  console.log(`GET ${baseUrl}/health`);
  const health = await fetch(`${baseUrl}/health`);
  console.log(await health.json());

  console.log(`\nPOST ${baseUrl}/api/story`);
  const response = await fetch(`${baseUrl}/api/story`, {
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
    `\nCould not reach ${baseUrl}. Is the server running?\n  cd story-agent && npm run server\n`,
  );
  console.error(error.message);
  process.exit(1);
});
