import { writeFileSync } from 'fs';
const q = 'hotels Eilat Israel site:booking.com';
const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
const r = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120' },
});
const html = await r.text();
writeFileSync('scripts/ddg-sample.html', html.slice(0, 8000));
console.log('saved', html.length);

const titles = [...html.matchAll(/class="result__a"[^>]*>([^<]+)</g)];
console.log('titles', titles.length, titles.slice(0, 3).map((m) => m[1]));
