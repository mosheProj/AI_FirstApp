import * as z from 'zod';

export const TravelOfferSchema = z.object({
  hotel: z.string().describe('Hotel or property name'),
  roomType: z.string().describe('Room type or board basis'),
  price: z.number().describe('Total or nightly price as a number'),
  currency: z.string().default('USD').describe('Currency code'),
  link: z.string().describe('Direct URL to the offer'),
  source: z.string().describe('Travel website name, e.g. Booking.com'),
});

export const OffersResponseSchema = z.object({
  offers: z
    .array(TravelOfferSchema)
    .max(10)
    .describe('Up to 10 travel offers sorted by price descending'),
});
