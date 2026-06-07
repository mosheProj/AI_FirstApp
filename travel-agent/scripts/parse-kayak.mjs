const t = await (
  await fetch(
    'https://r.jina.ai/https://www.kayak.com/hotels/Eilat-123456/2026-06-17/2026-06-18/2adults',
  )
).text();
const blocks = t.split('\n').filter((l) => l.includes('$') && l.length < 200);
console.log(blocks.slice(0, 20));
