const q = 'hotels Eilat Israel booking 2026';
const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
const r = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
});
const html = await r.text();
console.log('status', r.status, 'length', html.length);
const re = /uddg=([^&"]+)[^>]*>([^<]+)</g;
let m;
let n = 0;
while ((m = re.exec(html)) !== null && n < 5) {
  console.log(decodeURIComponent(m[1]), m[2]);
  n++;
}
