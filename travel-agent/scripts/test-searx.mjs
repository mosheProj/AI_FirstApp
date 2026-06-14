const q = 'hotels Eilat Israel booking';
const url = `https://searx.be/search?q=${encodeURIComponent(q)}&format=json`;
try {
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await r.json();
  console.log('status', r.status, 'results', data.results?.length);
  data.results?.slice(0, 5).forEach((x) => {
    console.log(x.title, x.url);
  });
} catch (e) {
  console.error(e.message);
}
