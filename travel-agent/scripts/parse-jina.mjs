const u =
  'https://r.jina.ai/https://www.booking.com/searchresults.html?ss=Eilat&checkin=2026-06-17&checkout=2026-06-18&group_adults=2';
const t = await (await fetch(u)).text();
const lines = t.split('\n');
const hotels = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('property-card') || line.match(/^### [^#]/) && !line.includes('Book now') && !line.includes('million')) {
    hotels.push(line);
  }
  if (line.match(/^\*\*.*\*\*$/) && lines[i + 1]?.includes('$')) {
    hotels.push(line + ' | ' + lines[i + 1]);
  }
}
console.log('lines with hotel', hotels.slice(0, 15));
const propLinks = [...t.matchAll(/\[([^\]]{5,80})\]\(https:\/\/www\.booking\.com\/hotel/g)];
console.log('hotel links', propLinks.slice(0, 8).map((m) => m[1]));
