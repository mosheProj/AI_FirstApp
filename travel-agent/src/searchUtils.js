export function normalizeDate(dateStr) {
  const trimmed = dateStr.trim();
  const slash = trimmed.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (slash) {
    const [, a, b, y] = slash;
    return `${y}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
  }
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return trimmed;
  return trimmed;
}

export function buildGoogleTravelUrl(location, startDate, endDate, adults) {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  const q = encodeURIComponent(location);
  return `https://www.google.com/travel/hotels/${q}?dates=${start},${end}&guests=${adults}`;
}

export function buildBookingUrl(location, startDate, endDate, adults) {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  const ss = encodeURIComponent(location);
  return `https://www.booking.com/searchresults.html?ss=${ss}&checkin=${start}&checkout=${end}&group_adults=${adults}`;
}

/** Working deep link: Google Travel search for a named property (not /hotels/{name} path). */
export function buildHotelTravelSearchLink(hotel, location) {
  const q = encodeURIComponent(`${hotel} ${location}`.trim());
  return `https://www.google.com/travel/search?q=${q}&qs=CAE4AA`;
}

/** Google Maps place search — reliable when entity URLs are unavailable. */
export function buildHotelMapsLink(hotel, location) {
  const q = encodeURIComponent(`${hotel}, ${location}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** Booking search for a specific hotel with trip dates. */
export function buildHotelBookingLink(hotel, location, startDate, endDate, adults) {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  const ss = encodeURIComponent(`${hotel} ${location}`.trim());
  return `https://www.booking.com/searchresults.html?ss=${ss}&checkin=${start}&checkout=${end}&group_adults=${adults}`;
}

/** Primary offer link: Booking (dates + hotel) with Google Maps fallback in hotelLinks. */
export function buildHotelOfferLink(hotel, location, startDate, endDate, adults) {
  return buildHotelBookingLink(hotel, location, startDate, endDate, adults);
}

const NOISE_HEADERS = new Set([
  'Sponsored Eilat hotels',
  'Sponsored South District hotels',
  'Set your dates to update prices',
]);

export function isNoiseHeader(name) {
  const n = name.trim();
  if (n.length < 4) return true;
  if (NOISE_HEADERS.has(n)) return true;
  if (n.includes('results')) return true;
  if (n.includes('Sponsored')) return true;
  if (n.includes('URL Source')) return true;
  if (/^[\p{L}\s]+·[\d,]+ results$/u.test(n)) return true;
  return false;
}

export function extractHotelsFromMarkdown(text) {
  return [...text.matchAll(/^## ([^\n]+)/gm)]
    .map((m) => m[1].trim())
    .filter((name) => !isNoiseHeader(name));
}

export function extractPriceFromBlock(block) {
  const patterns = [
    { re: /₪\s*([\d,]+)/, currency: 'ILS' },
    { re: /([\d,]+)\s*₪/, currency: 'ILS' },
    { re: /\$\s*([\d,]+)/, currency: 'USD' },
    { re: /([\d,]+)\s*USD/i, currency: 'USD' },
  ];

  for (const { re, currency } of patterns) {
    const m = block.match(re);
    if (!m) continue;
    const value = parseInt(m[1].replace(/,/g, ''), 10);
    if (value >= 50 && value < 50000) {
      return { value, currency };
    }
  }
  return null;
}

export function parseGoogleHotelListings(markdown) {
  if (!markdown) return [];

  const listings = [];
  const sections = markdown.split(/^## /gm).slice(1);

  for (const section of sections) {
    const name = section.split('\n')[0].trim();
    if (isNoiseHeader(name)) continue;

    const body = section.slice(name.length);
    const starMatch =
      body.match(/,\s*a\s*(\d)-star\s*hotel/i) ||
      body.match(/(\d)-star\s*hotel/i);
    const stars = starMatch ? parseInt(starMatch[1], 10) : null;
    const price = extractPriceFromBlock(body);

    listings.push({
      name,
      stars,
      price,
      isPremium: isPremiumListing(name, body, stars),
      body: body.slice(0, 500),
    });
  }

  return listings;
}

export function isPremiumListing(name, body, stars) {
  const n = name.toLowerCase();
  const b = (body || '').toLowerCase();

  if (/hostel|motel|budget inn|backpack|dorm/i.test(n)) return false;
  if (/single room|vacation rental/i.test(n) && !/luxury|resort|5-star|4-star/i.test(b)) {
    return false;
  }

  if (stars !== null && stars >= 4) return true;
  if (/5-star|4-star|luxury|resort|palace|boutique/i.test(b)) return true;
  if (
    /six senses|beresheet|isrotel|dan hotel|hilton|marriott|hyatt|kempinski|ritz|waldorf|w hotel/i.test(
      n,
    )
  ) {
    return true;
  }
  if (/hotel|resort|spa/i.test(n) && !/inn -|motel/i.test(n)) {
    return stars === null ? b.includes('star') : true;
  }

  return false;
}

export function extractPricesFromText(text) {
  const prices = new Set();
  for (const m of text.matchAll(/\$\s*([\d,]+)/g)) {
    const value = parseInt(m[1].replace(/,/g, ''), 10);
    if (value >= 20 && value < 5000) prices.add(value);
  }
  for (const m of text.matchAll(/₪\s*([\d,]+)/g)) {
    const value = parseInt(m[1].replace(/,/g, ''), 10);
    if (value >= 50 && value < 20000) prices.add(value);
  }
  return [...prices].sort((a, b) => b - a);
}

export async function fetchViaJina(pageUrl) {
  const jinaUrl = `https://r.jina.ai/${pageUrl}`;
  const response = await fetch(jinaUrl, {
    headers: {
      Accept: 'text/plain',
      'User-Agent': 'TravelDealsAgent/1.0',
    },
    signal: AbortSignal.timeout(90000),
  });

  if (!response.ok) {
    throw new Error(`Could not read ${pageUrl} (status ${response.status})`);
  }

  return await response.text();
}

export function buildFallbackOffers(listings, searchParams) {
  const { location, startDate, endDate, adults } = searchParams;
  const premium = listings.filter((l) => l.isPremium).slice(0, 10);

  const offers = premium.map((listing) => {
    const hasPrice = listing.price?.value > 0;
    return {
      hotel: listing.name,
      roomType: listing.stars
        ? `${listing.stars}-star premium`
        : 'Premium — see link for room types',
      price: hasPrice ? listing.price.value : 0,
      currency: listing.price?.currency ?? 'USD',
      link: buildHotelOfferLink(listing.name, location, startDate, endDate, adults),
      source: 'Google Travel',
    };
  });

  return sortOffersByPriceDesc(offers);
}

export function buildHotelLinkMap(listings, searchParams) {
  const { location, startDate, endDate, adults } = searchParams;
  return listings.slice(0, 10).map((listing) => ({
    hotel: listing.name,
    booking: buildHotelBookingLink(
      listing.name,
      location,
      startDate,
      endDate,
      adults,
    ),
    googleTravel: buildHotelTravelSearchLink(listing.name, location),
    maps: buildHotelMapsLink(listing.name, location),
  }));
}

/** Always rewrite links from canonical builders (fixes broken /hotels/{name} URLs). */
export function ensurePerHotelLinks(offers, searchParams) {
  if (!offers?.length) return offers;

  return offers.map((offer) => ({
    ...offer,
    link: buildHotelOfferLink(
      offer.hotel,
      searchParams.location,
      searchParams.startDate,
      searchParams.endDate,
      searchParams.adults,
    ),
  }));
}

/** Drop invented prices when the tool did not provide a price for that hotel. */
export function sanitizeOfferPrices(offers, parsedListings) {
  if (!offers?.length) return offers;

  const priceByHotel = new Map(
    (parsedListings ?? []).map((l) => [l.name, l.price]),
  );

  return offers.map((offer) => {
    const known = priceByHotel.get(offer.hotel);
    if (known?.value > 0) {
      return {
        ...offer,
        price: known.value,
        currency: known.currency ?? offer.currency,
      };
    }
    return {
      ...offer,
      price: 0,
      roomType:
        offer.price > 0
          ? `${offer.roomType} (price not verified — check link)`
          : offer.roomType || 'See link for live price',
    };
  });
}

export function sortOffersByPriceDesc(offers) {
  return [...offers]
    .sort((a, b) => {
      if (a.price <= 0 && b.price <= 0) return 0;
      if (a.price <= 0) return 1;
      if (b.price <= 0) return -1;
      return b.price - a.price;
    })
    .slice(0, 10);
}
