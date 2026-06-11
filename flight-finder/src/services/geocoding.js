const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

async function geocodePlace(name) {
  const params = new URLSearchParams({
    name: name.trim(),
    count: '1',
    language: 'en',
    format: 'json',
  });

  const response = await fetch(`${GEOCODING_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Geocoding failed for "${name}" (${response.status})`);
  }

  const data = await response.json();
  const place = data.results?.[0];
  if (!place) {
    throw new Error(`No geocoding match found for "${name}"`);
  }

  return {
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    country: place.country,
    countryCode: place.country_code,
    admin1: place.admin1 ?? '',
    timezone: place.timezone ?? '',
  };
}

export async function geocodeLocations(source, destination) {
  const [sourceResult, destinationResult] = await Promise.all([
    geocodePlace(source),
    geocodePlace(destination),
  ]);

  return {
    source: sourceResult,
    destination: destinationResult,
  };
}
