import { tool } from 'langchain';
import * as z from 'zod';
import {
  buildBookingUrl,
  buildFallbackOffers,
  buildGoogleTravelUrl,
  buildHotelLinkMap,
  fetchViaJina,
  parseGoogleHotelListings,
} from './searchUtils.js';

const SearchSchema = z.object({
  location: z.string().describe('Destination city or region'),
  startDate: z.string().describe('Check-in date'),
  endDate: z.string().describe('Check-out date'),
  adults: z.string().describe('Number of adult guests'),
});

export const searchTravelSites = tool(
  async ({ location, startDate, endDate, adults }) => {
    const googleUrl = buildGoogleTravelUrl(location, startDate, endDate, adults);
    const bookingUrl = buildBookingUrl(location, startDate, endDate, adults);

    const payload = {
      location,
      startDate,
      endDate,
      adults,
      links: { googleTravel: googleUrl, booking: bookingUrl },
      parsedListings: [],
      hotels: [],
      excerpts: {},
      errors: [],
    };

    let googleText = '';

    try {
      googleText = await fetchViaJina(googleUrl);
      payload.excerpts.googleTravel = googleText.slice(0, 12000);
      payload.parsedListings = parseGoogleHotelListings(googleText);
      payload.hotels = payload.parsedListings.map((l) => l.name);
    } catch (error) {
      payload.errors.push(`Google Travel: ${error.message}`);
    }

    try {
      const bookingText = await fetchViaJina(bookingUrl);
      payload.excerpts.booking = bookingText.slice(0, 8000);
    } catch (error) {
      payload.errors.push(`Booking.com: ${error.message}`);
    }

    if (payload.parsedListings.length === 0 && payload.errors.length) {
      return JSON.stringify({
        success: false,
        message:
          'Could not load travel sites. Check your internet connection and try again.',
        errors: payload.errors,
        links: payload.links,
      });
    }

    const searchParams = { location, startDate, endDate, adults };
    const premiumListings = payload.parsedListings.filter((l) => l.isPremium);

    payload.hotelLinks = buildHotelLinkMap(premiumListings, searchParams);
    payload.fallbackOffers = buildFallbackOffers(premiumListings, searchParams);
    payload.premiumCount = premiumListings.length;
    payload.pricesAvailable = premiumListings.filter((l) => l.price?.value > 0).length;

    payload.success = true;
    payload.message =
      'Use parsedListings and fallbackOffers for premium hotels. Copy link from fallbackOffers/hotelLinks.booking. Use price only when parsedListings[].price is set; otherwise price=0. Sort by price descending.';

    return JSON.stringify(payload, null, 2);
  },
  {
    name: 'search_travel_sites',
    description:
      'Fetch live hotel listings from Google Travel for the trip. Returns parsedListings (name, stars, price if visible, isPremium), fallbackOffers, and per-hotel booking links.',
    schema: SearchSchema,
  },
);

export const tools = [searchTravelSites];
