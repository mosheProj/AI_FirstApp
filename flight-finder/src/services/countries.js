const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1/alpha';

export async function lookupCountries(countryCodes) {
  const codes = [...new Set(countryCodes.map((c) => c.trim().toUpperCase()).filter(Boolean))];
  if (!codes.length) {
    throw new Error('At least one country code is required.');
  }

  const params = new URLSearchParams({
    codes: codes.join(','),
    fields: 'name,cca2,flag,capital',
  });

  const response = await fetch(`${REST_COUNTRIES_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`REST Countries lookup failed (${response.status})`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No country data found for codes: ${codes.join(', ')}`);
  }

  const byCode = Object.fromEntries(
    data.map((country) => [
      country.cca2,
      {
        code: country.cca2,
        name: country.name?.common ?? country.cca2,
        officialName: country.name?.official ?? country.name?.common ?? country.cca2,
        flag: country.flag ?? '',
        capital: country.capital?.[0] ?? '',
      },
    ]),
  );

  return { countries: byCode, codes };
}
