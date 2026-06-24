import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db.js";
import { computeTrustScore } from "./trust.js";

export const searchListingsTool: Anthropic.Tool = {
  name: "search_listings",
  description:
    "Search active property listings by type, neighborhood, price range, and bedrooms. " +
    "Use this whenever the user describes what kind of property they want, even partially " +
    "— call it again with refined filters as you learn more from the conversation.",
  input_schema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["SALE", "RENT"],
        description: "Whether the user wants to buy or rent.",
      },
      neighborhood: {
        type: "string",
        description: "Neighborhood or area name, e.g. Mansour, Karrada. Partial match is fine.",
      },
      minPrice: { type: "number", description: "Minimum price in USD." },
      maxPrice: { type: "number", description: "Maximum price in USD." },
      bedrooms: { type: "number", description: "Exact number of bedrooms requested." },
    },
  },
};

export interface SearchListingsArgs {
  type?: "SALE" | "RENT";
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}

export interface ListingSearchResult {
  id: string;
  title: string;
  type: string;
  price: number;
  currency: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  officeStatedCondition: string;
  officeName: string;
  trustScore: number;
}

export async function executeSearchListings(args: SearchListingsArgs): Promise<ListingSearchResult[]> {
  const listings = await db.listing.findMany({
    where: {
      status: "ACTIVE",
      type: args.type,
      neighborhood: args.neighborhood ? { contains: args.neighborhood } : undefined,
      bedrooms: args.bedrooms,
      price: {
        gte: args.minPrice,
        lte: args.maxPrice,
      },
    },
    include: { office: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return Promise.all(
    listings.map(async (listing) => {
      const { score } = await computeTrustScore(listing.id);
      return {
        id: listing.id,
        title: listing.title,
        type: listing.type,
        price: listing.price,
        currency: listing.currency,
        neighborhood: listing.neighborhood,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        areaSqm: listing.areaSqm,
        officeStatedCondition: listing.officeStatedCondition,
        officeName: listing.office.name,
        trustScore: score,
      };
    })
  );
}
